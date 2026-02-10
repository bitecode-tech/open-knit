---
description: "Inspired by https://github.com/gakeez/agents_md_collection"
---

# Modern React Project Development Guide

## Project Overview

This is a modern frontend project template based on React 19, TypeScript, and Vite. It's suitable for building high-performance Single Page Applications (SPA) with integrated
modern development toolchain and best practices.

## Modules & Boundaries

- Feature code lives in `modules/<module>/...` and each module is treated as a separate unit.
- Avoid cross-module dependencies unless the code is clearly shared; prefer `_common` for shared utilities and UI.
- Module-specific UI, services, types, hooks, and pages belong inside the module.
- App-level code that is not tied to a specific module (shell layout, global routes, entry points) lives in `src/`.

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS / Styled-components
- **HTTP Client**: Axios
- **Code Quality**: ESLint + Prettier

## Project Structure

### Root (current)

```
frontend/
├── public/                     # Static assets
├── src/                        # App shell
│   ├── assets/
│   ├── components/
│   │   └── admin/
│   │       └── dashboard/
│   ├── pages/
│   │   └── admin/
│   │       └── dashboard/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── modules/....                    # Feature modules
├── .editorconfig
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

### Module (generic)

```
modules/<module-name>/
├── clients/                   # HTTP clients
├── components/                # UI components
├── contexts/                  # React contexts (optional)
├── hooks/                     # Custom hooks (optional)
├── pages/                     # Route pages
├── services/                  # Domain services
├── types/                     # Types/models/DTOs
├── utils/                     # Helpers (optional)
└── _scaffolder/               # Module layout config
```

## Development Guidelines

### TypeScript checks (required)

- ALWAYS run a TypeScript typecheck before finishing any task that touches code in this directory.
- Use this command and include any relevant errors or confirmations in your response:
    - `pnpm run typecheck`

### Component Development Standards

1. **Function Components First**: Use function components and Hooks
2. **TypeScript Types**: Define interfaces for all props
3. **Type Placement**: Keep shared types/interfaces in separate files (e.g., `modules/<module>/types/`); only component prop types may live alongside the component.
4. **Component Naming**: Use PascalCase, file name matches component name
5. **Directory & File Naming**:
    - Directories: kebab-case (e.g., `user-settings/`)
    - Components: PascalCase (e.g., `UserSettings.tsx`)
    - Utilities/helpers: camelCase (e.g., `formatCurrency.ts`, `dateUtils.ts`)
5. **Prefer Common Building Blocks**: Use shared components and utilities from `modules/_common` before creating new ones.
    - Components: `GenericButton`, `GenericTable`, `GenericTablePagination`, `GenericModal`, `GenericSideModal`, `ActionModal`,
      `DoubleButtonActionModal`, `GenericFormTextInput`, `GenericFormSelectInput`, `GenericFormTextArea`, `GenericCheckbox`,
      `GenericFormToggleSwitch`, `GenericTooltip`, `GenericLink`, `ColoredLabel`, `Breadcrumbs`, `ActionsDropdown`,
      `MarkdownRenderer`, `SpinnerTextLoader`, `SlotAnimatedNumber`, `ApplicationShell`, `ProtectedRoute`
    - Table helpers: `GenericTableSearchFilter`, `GenericTableDateFilter`, `GenericTableClearFilters`,
      `GenericTableActionButton`, `GenericTableClipboardCopy`, `GenericTableCurrencyCell`
    - Utils: `PaginationUtils`, `DateFormatterUtils`, `MoneyUtils`, `StringUtils`, `EnumUtils`, `CsvUtils`, `TypeUtils`
4. **Single Responsibility**: Each component handles only one functionality

```tsx
// Example: Button Component
interface ButtonProps {
    variant: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant,
                                                  size = 'medium',
                                                  disabled = false,
                                                  onClick,
                                                  children
                                              }) => {
    return (
            <button
                    className={`btn btn-${variant} btn-${size}`}
                    disabled={disabled}
                    onClick={onClick}
            >
                {children}
            </button>
    );
};
```

### API Service Standards

```ts
// modules/_common/config/AxiosConfig.ts (example)
import {CreateAxiosDefaults} from "axios";

const commonConfig: CreateAxiosDefaults = {
    baseURL: (import.meta.env.VITE_BACKEND_URL || "http://localhost:8080") + "/api",
    timeout: 15000,
    withCredentials: true,
};

const adminBaseConfig: CreateAxiosDefaults = {
    ...commonConfig,
    baseURL: commonConfig.baseURL + "/admin",
};

export {commonConfig, adminBaseConfig};
```

```ts
// modules/<module>/clients/http/<Client>.ts (example)
import {AxiosInstance, AxiosResponse} from "axios";
import {adminBaseConfig} from "@common/config/AxiosConfig.ts";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import AuthService from "@identity/auth/services/AuthService.ts";
import {axiosRequestConfigOf} from "@common/utils/PaginationUtils.ts";

type Item = {
    id: string;
};

class ExampleClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = AuthService.createAuthenticatedClientInstance(adminBaseConfig, "/resource");
    }

    async list(page: PagedRequest<void>): Promise<AxiosResponse<PagedResponse<Item>>> {
        return await this.axios.get<PagedResponse<Item>>("", axiosRequestConfigOf(page));
    }
}

export default new ExampleClient();
```

## Routing Configuration

```tsx
// src/App.tsx (example)
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {AuthProvider} from "@identity/auth/contexts/AuthContext.tsx";
import {ProtectedRoute} from "@common/components/router/ProtectedRoute.tsx";
import {AdminLayout} from "@app/components/admin/AdminLayout.tsx";

function AppRoutesWithAuth() {
    return (
            <Routes>
                {/* public auth routes */}
                {/* ...login/register/forgot... */}

                {/* protected admin area */}
                <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute>
                                <AdminLayout/>
                            </ProtectedRoute>
                        }
                />

                {/* fallback */}
                <Route path="*" element={<Navigate to="/login"/>}/>
            </Routes>
    );
}

function App() {
    return (
            <Router>
                <Routes>
                    {/* routes that never use AuthProvider */}
                    {/*...*/}

                    {/* main app */}
                    <Route
                            path="/*"
                            element={
                                <AuthProvider>
                                    <AppRoutesWithAuth/>
                                </AuthProvider>
                            }
                    />
                </Routes>
            </Router>
    );
}
```

```tsx
// src/components/admin/AdminLayout.tsx (example)
import {Navigate, useRoutes} from "react-router-dom";
import {transactionsAdminLayoutConfig} from "@transaction/_scaffolder/TransactionsAdminLayoutConfig.tsx";
import {paymentsAdminLayoutConfig} from "@payment/_scaffolder/PaymentsAdminLayoutConfig.tsx";

const adminModuleConfigs = [transactionsAdminLayoutConfig, paymentsAdminLayoutConfig];

export function AdminLayout() {
    const routes = useRoutes([
        {index: true, element: <Navigate to="dashboard" replace/>},
        {path: "dashboard", element: <div>Dashboard</div>},
        ...adminModuleConfigs.flatMap((moduleConfig) => moduleConfig.routes ?? []),
    ]);

    return routes;
}
```

## Performance Optimization

### Code Splitting

```tsx
import {lazy, Suspense} from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
    return (
            <Suspense fallback={<div>Loading...</div>}>
                <LazyComponent/>
            </Suspense>
    );
}
```

### Memory Optimization

```tsx
import {memo, useMemo, useCallback} from 'react';

const ExpensiveComponent = memo(({data, onUpdate}) => {
    const processedData = useMemo(() => {
        return data.map(item => ({...item, processed: true}));
    }, [data]);

    const handleUpdate = useCallback((id) => {
        onUpdate(id);
    }, [onUpdate]);

    return (
            <div>
                {processedData.map(item => (
                        <div key={item.id} onClick={() => handleUpdate(item.id)}>
                            {item.name}
                        </div>
                ))}
            </div>
    );
});
```

## Common Issues

### Issue 1: Vite Development Server Slow Startup

**Solution**:

- Check dependency pre-build cache
- Use `npm run dev -- --force` to force rebuild
- Optimize optimizeDeps configuration in vite.config.ts

### Issue 2: TypeScript Type Errors

**Solution**:

- Ensure correct type definition packages are installed
- Check tsconfig.json configuration
- Use `npm run type-check` for type checking

## Reference Resources

- [React Official Documentation](https://react.dev/)
- [Vite Official Documentation](https://vitejs.dev/)
- [TypeScript Official Documentation](https://www.typescriptlang.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
