import type {ReactNode} from "react";
import "@app/styles/index.css";

export default function Layout({children}: { children: ReactNode }) {
    return <div className="app-shell">{children}</div>;
}
