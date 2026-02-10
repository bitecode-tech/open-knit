# Internal Java Backend Modules - System Architecture Overview

## 🏗️ **System Architecture**

This is a **modular Spring Boot application** built using **Spring Modulith** architecture pattern. The system is designed as a **microservices-ready monolith** with clear module boundaries, event-driven communication, and domain-driven design principles.

### **Core Architecture Principles**

- **Modular Monolith**: Single application with clear module boundaries
- **Event-Driven Architecture**: Inter-module communication via Spring Events
- **Domain-Driven Design**: Each module represents a business domain
- **CQRS Pattern**: Separate read/write models where appropriate
- **Event Sourcing**: For critical business flows (transactions, payments)
- **Multi-Tenant Database**: PostgreSQL with schema-per-module approach

---

## 📦 **Module Overview**

### **1. Authentication & Authorization Module (`auth`)**
**Purpose**: User management, authentication, and authorization

**Key Components**:
- **AuthController**: OAuth2 login/logout, JWT token management
- **UserController**: User CRUD operations, profile management
- **AuthService**: Authentication business logic
- **JwtService**: JWT token generation and validation
- **TOTPService**: Two-factor authentication

**Features**:
- OAuth2 integration (Google)
- JWT-based authentication
- Refresh token mechanism
- TOTP (Time-based One-Time Password)
- Role-based access control (ADMIN, USER)

**Database Schema**: `auth`

---

### **2. Transaction Module (`transaction`)**
**Purpose**: Financial transaction management and event sourcing

**Key Components**:
- **AdminTransactionController**: Transaction management API
- **TransactionService**: Transaction business logic
- **TransactionRepository**: Data access layer
- **Event Handlers**: Process transaction-related events

**Features**:
- Transaction creation and management
- Event sourcing for transaction history
- Transaction status tracking
- Pagination and filtering
- Integration with payment and wallet modules

**Events**:
- `NewTransactionEvent`: Triggered when new transaction is created
- `TransactionStatusChangedEvent`: Status updates

**Database Schema**: `transaction`

---

### **3. Payment Module (`payment`)**
**Purpose**: Payment processing and gateway integrations

**Key Components**:
- **AdminPaymentController**: Payment management API
- **PaymentService**: Payment processing logic
- **SubscriptionController**: Subscription management
- **Payment Providers**: Stripe, PayPal integrations

**Features**:
- Multiple payment gateway support
- Subscription management
- Webhook processing
- Payment status tracking
- Integration with transaction module

**Events**:

- `PaymentCreatedCommand`: New payment created
- `PaymentStatusChangedEvent`: Payment status updates

**Database Schema**: `payment`

---

### **4. Wallet Module (`wallet`)**
**Purpose**: Digital wallet and asset management

**Key Components**:
- **WalletService**: Wallet business logic
- **WalletAssetEventHandler**: Processes wallet asset events
- **WalletRepository**: Data access layer

**Features**:
- Asset balance tracking
- Multi-currency support
- Event-driven balance updates
- Integration with transaction module

**Events**:
- `CreateWalletAssetEvent`: New wallet asset created
- `AddWalletAssetEvent`: Assets added to wallet
- `SubtractWalletAssetEvent`: Assets removed from wallet

**Database Schema**: `wallet`

---

### **5. Notification Module (`notification`)**
**Purpose**: Multi-channel notification system

**Key Components**:
- **AdminNotificationController**: Notification management API
- **NotificationService**: Notification business logic
- **Notification Providers**: Email, SMS, WebPush
- **Schedulers**: Background notification processing

**Features**:
- Multi-channel notifications (Email, SMS, WebPush)
- Bulk notification support
- Notification scheduling
- Template-based notifications
- Provider abstraction

**Database Schema**: `notification`

---

### **6. AI Module (`ai`)**
**Purpose**: AI-powered chat and knowledge management

**Key Components**:
- **AdminAiChatController**: AI chat management
- **NoAuthAiChatController**: Public AI chat
- **ChatAiService**: AI conversation logic
- **Agent Strategies**: Different AI agent implementations

**Features**:
- AI-powered chat conversations
- Multiple AI agent strategies
- Chat session management
- Knowledge base integration
- Vector storage (Qdrant)

**Database Schema**: `ai`

---

### **7. Blockchain Module (`blockchain`)**
**Purpose**: Blockchain transaction management

**Key Components**:
- **BlockchainController**: Blockchain API
- **BlockchainService**: Business logic
**Features**:
- Transaction retrieval and filtering
- Pagination support

**Database Schema**: `blockchain`

---

### **8. Common Module (`_common`)**
**Purpose**: Shared utilities and infrastructure

**Key Components**:
- **Event Sourcing**: Event infrastructure
- **Configuration**: Global configurations
- **Utilities**: Shared utilities
- **Model**: Common data structures

**Features**:
- Event sourcing infrastructure
- Common annotations and utilities
- Global exception handling
- Shared configurations

---

## 🔄 **Event-Driven Communication**

### **Event Flow Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Payment   │───▶│ Transaction │───▶│   Wallet    │
│   Module    │    │   Module    │    │   Module    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Notification │    │     AI      │    │ Blockchain  │
│   Module    │    │   Module    │    │   Module    │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Key Event Types**

1. **Payment Events**:
    - `PaymentCreatedCommand`
   - `PaymentStatusChangedEvent`

2. **Transaction Events**:
   - `NewTransactionEvent`
   - `TransactionStatusChangedEvent`

3. **Wallet Events**:
   - `CreateWalletAssetEvent`
   - `AddWalletAssetEvent`
   - `SubtractWalletAssetEvent`

---

## 🗄️ **Database Architecture**

### **Multi-Schema Design**
Each module has its own PostgreSQL schema:

- `auth` - Authentication and user management
- `transaction` - Financial transactions
- `payment` - Payment processing
- `wallet` - Digital wallet
- `notification` - Notification system
- `ai` - AI chat and knowledge
- `blockchain` - Blockchain transactions
- `demo-app` - Demo application data

### **Migration Strategy**
- **Flyway** for database migrations
- Schema-per-module approach
- Version-controlled migrations
- Automatic schema validation

---

## 🔐 **Security Architecture**

### **Authentication Flow**
1. **OAuth2 Login** → Google OAuth2
2. **JWT Token Generation** → Access + Refresh tokens
3. **Token Validation** → Spring Security filters
4. **Role-Based Access** → ADMIN/USER roles

### **Security Features**
- JWT-based authentication
- Refresh token mechanism
- OAuth2 integration
- TOTP (Two-Factor Authentication)
- Role-based access control
- Secure cookie handling

---

## 🚀 **External Integrations**

### **Payment Gateways**
- **Stripe**: Primary payment processor
- **Webhook Support**: Real-time payment updates
- **Multi-Currency**: Support for various currencies

### **AI Services**
- **OpenAI**: GPT models for chat
- **Qdrant**: Vector database for embeddings
- **Spring AI**: AI integration framework

### **Communication Services**
- **Email**: SMTP-based email notifications
- **SMS**: SMS notification provider
- **WebPush**: Browser push notifications

### **Blockchain Services**
- **RabbitMQ**: RPC communication
- **External Blockchain APIs**: Via RPC calls

---

## 📊 **Data Flow Examples**

### **Payment Processing Flow**
```
1. User initiates payment
   ↓
2. Payment Module creates payment
   ↓
3. PaymentCreatedCommand published
   ↓
4. Transaction Module creates transaction
   ↓
5. NewTransactionEvent published
   ↓
6. Wallet Module updates balances
   ↓
7. Notification Module sends confirmation
```

### **AI Chat Flow**
```
1. User sends message to AI
   ↓
2. AI Module processes with agent strategy
   ↓
3. Chat session created/updated
   ↓
4. AI response generated
   ↓
5. Message logged to database
   ↓
6. Response sent to user
```

### **Notification Flow**
```
1. Event triggers notification
   ↓
2. Notification Service creates message
   ↓
3. Provider selected (Email/SMS/WebPush)
   ↓
4. Message queued for delivery
   ↓
5. Scheduler processes queue
   ↓
6. Provider sends notification
```

---

## 🛠️ **Technology Stack**

### **Core Framework**
- **Spring Boot 3.4.4**: Application framework
- **Spring Modulith**: Modular architecture
- **Spring Security**: Authentication & authorization
- **Spring Data JPA**: Data access layer
- **Spring Events**: Event-driven communication

### **Database & Migration**
- **PostgreSQL**: Primary database
- **Flyway**: Database migrations
- **Hibernate**: ORM framework

### **Messaging & Integration**
- **RabbitMQ**: Message queuing and RPC
- **Spring AMQP**: RabbitMQ integration

### **AI & Machine Learning**
- **Spring AI**: AI integration framework
- **OpenAI**: GPT models
- **Qdrant**: Vector database

### **Security & Authentication**
- **JWT**: Token-based authentication
- **OAuth2**: Social login
- **TOTP**: Two-factor authentication

### **Testing & Development**
- **JUnit 5**: Unit testing
- **Spring Boot Test**: Integration testing
- **TestContainers**: Containerized testing
- **MockMvc**: Web layer testing

---

## 🔧 **Configuration Management**

### **Environment Variables**
- Database configuration
- External service credentials
- RabbitMQ settings
- AI service keys
- Payment gateway credentials

### **Profile-Based Configuration**
- **DEV**: Development settings
- **TEST**: Testing configuration
- **PROD**: Production settings

---

## 📈 **Scalability Considerations**

### **Horizontal Scaling**
- Stateless application design
- Database connection pooling
- Message queue for async processing
- Caching strategies

### **Performance Optimizations**
- Virtual threads enabled
- Database query optimization
- Pagination for large datasets
- Event sourcing for audit trails

---

## 🔍 **Monitoring & Observability**

### **Logging**
- Structured logging with SLF4J
- Module-specific log levels
- Error tracking and monitoring

### **Health Checks**
- Spring Boot Actuator
- Database connectivity checks
- External service health monitoring

---

## 🚀 **Deployment Architecture**

### **Containerization**
- **Docker**: Application containerization
- **Docker Compose**: Local development environment
- **Multi-stage builds**: Optimized production images

### **Infrastructure Services**
- **PostgreSQL**: Database
- **RabbitMQ**: Message queuing
- **Qdrant**: Vector database

---

## 📋 **Development Workflow**

### **Module Development**
1. Create module structure
2. Define domain models
3. Implement business logic
4. Add event handlers
5. Create API endpoints
6. Write tests
7. Add database migrations

### **Testing Strategy**
- Unit tests for business logic
- Integration tests for modules
- End-to-end API testing
- Event flow testing

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **Microservices Migration**: Split modules into separate services
- **Kubernetes Deployment**: Container orchestration
- **Advanced AI Features**: More sophisticated AI agents
- **Real-time Communication**: WebSocket support
- **Advanced Analytics**: Business intelligence features
- **Mobile API**: Mobile-specific endpoints

### **Architecture Evolution**
- **Event Streaming**: Apache Kafka integration
- **CQRS Implementation**: Separate read/write models
- **API Gateway**: Centralized API management
- **Service Mesh**: Inter-service communication

---

This architecture provides a solid foundation for a scalable, maintainable, and feature-rich financial application with AI capabilities, blockchain integration, and comprehensive notification systems. 