# Salva Clients Mobile

Flutter mobile application for veterinary clinic management system.

## 🛠️ Installation Requirements

### 1. Install Flutter SDK

**Option A: Using Chocolatey (Recommended)**

```bash
# Install Chocolatey if not already installed
# Run in PowerShell as Administrator:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Flutter
choco install flutter -y

# IMPORTANT: Close and reopen PowerShell/Terminal after installation
# Flutter will be installed in: C:\tools\flutter

# Verify installation
flutter doctor
```

**If flutter command not found after installation:**
1. Close ALL PowerShell/Terminal windows
2. Open a NEW PowerShell window
3. Run: `flutter doctor`
4. If still not working, manually add to PATH:
   - Search "Environment Variables" in Windows
   - Edit "Path" in System Variables
   - Add: `C:\tools\flutter\bin`
   - Restart terminal

**Option B: Manual Installation**
1. Download Flutter SDK from: https://docs.flutter.dev/get-started/install/windows
2. Extract to: `C:\src\flutter`
3. Add to PATH: `C:\src\flutter\bin`
4. Run: `flutter doctor`

### 2. Install Required Tools

**Using Chocolatey:**
```bash
# Install Android Studio
choco install androidstudio -y

# Install VS Code (optional)
choco install vscode -y

# Install Git (if not already installed)
choco install git -y
```

**Manual Installation:**
- **Android Studio**: https://developer.android.com/studio
- **VS Code**: https://code.visualstudio.com/

**VS Code Extensions:**
- Flutter extension
- Dart extension

### 3. Setup Android SDK

**After installing Android Studio:**

1. Open Android Studio
2. Go to: `File` → `Settings` → `Appearance & Behavior` → `System Settings` → `Android SDK`
3. Note the SDK location (usually: `C:\Users\<username>\AppData\Local\Android\Sdk`)
4. Install SDK components:
   - Android SDK Platform (latest)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools

**Configure Flutter to use Android SDK:**
```bash
# Let Flutter detect Android Studio automatically
flutter doctor

# If Flutter can't find Android SDK, set it manually:
flutter config --android-sdk "C:\Users\gamba\AppData\Local\Android\Sdk"

# Accept Android licenses
flutter doctor --android-licenses
```

**Common Issues:**
- If `flutter doctor` shows "Android toolchain" issues, run: `flutter doctor --android-licenses`
- If cmdline-tools not found, install via Android Studio SDK Manager

### 4. Setup Android Emulator

**Create an emulator in Android Studio:**
1. Open Android Studio
2. Go to: `Tools` → `Device Manager` (or `AVD Manager`)
3. Click `Create Device`
4. Select a device (e.g., Pixel 5)
5. Download a system image (e.g., Android 13 - API 33)
6. Finish setup
7. Start the emulator

**Verify device is detected:
```bash
# List available devices
flutter devices

# Should show something like:
# Android SDK built for x86 (emulator) • emulator-5554 • android-x86 • Android 13 (API 33)
```

## 🚀 Quick Start

```bash
# IMPORTANT: Close and reopen terminal after Flutter installation

# Navigate to project directory
cd c:\Users\gamba\Documents\github\salva-clients\salva-clients-mobile

# Create Flutter project
flutter create .

# Install dependencies
flutter pub get

# Run the app
flutter run
```

## 📦 Project Structure

```
salva-clients-mobile/
├── lib/
│   ├── main.dart
│   ├── models/
│   │   ├── user.dart
│   │   ├── client.dart
│   │   ├── service.dart
│   │   └── product.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   └── storage_service.dart
│   ├── providers/
│   │   ├── auth_provider.dart
│   │   └── client_provider.dart
│   ├── screens/
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── clients/
│   │   │   ├── clients_list_screen.dart
│   │   │   ├── client_detail_screen.dart
│   │   │   └── client_form_screen.dart
│   │   ├── services/
│   │   │   └── services_screen.dart
│   │   └── inventory/
│   │       └── inventory_screen.dart
│   ├── widgets/
│   │   ├── custom_app_bar.dart
│   │   └── loading_indicator.dart
│   └── utils/
│       ├── constants.dart
│       └── theme.dart
├── pubspec.yaml
└── README.md
```

## 📋 Development Plan

### Phase 1: Setup & Authentication (MVP Core)
1. ✅ Create Flutter project structure
2. ⏳ Setup dependencies (http, provider, shared_preferences)
3. ⏳ Build API service layer
4. ⏳ Implement Login screen with JWT storage
5. ⏳ Create auth state management

### Phase 2: Client Management (Primary Feature)
6. ⏳ Clients list screen with search
7. ⏳ Client detail screen
8. ⏳ Add/Edit client forms
9. ⏳ Client services view

### Phase 3: Services & Inventory (Secondary Features)
10. ⏳ Services management screen
11. ⏳ Inventory management (3 tabs)
12. ⏳ Role-based UI rendering

### Phase 4: Polish (Optional)
13. ⏳ Offline caching
14. ⏳ Error handling & loading states
15. ⏳ Material Design 3 theming

## 📱 Key Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # HTTP & API
  http: ^1.1.0
  
  # Local Storage
  shared_preferences: ^2.2.2
  
  # JSON Serialization
  json_annotation: ^4.8.1
  
  # UI Components
  flutter_svg: ^2.0.9
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  json_serializable: ^6.7.1
  build_runner: ^2.4.6
```

## 🔧 Backend Configuration

### Update CORS in WebSecurityConfig.java

Change from:
```java
config.setAllowedOrigins(List.of("http://localhost:3000"));
```

To:
```java
config.setAllowedOriginPatterns(List.of("*")); // For development
```

Or for production:
```java
config.setAllowedOrigins(List.of(
    "http://localhost:3000",
    "http://10.0.2.2:8080"  // Android emulator
));
```

## 🎨 Design System

### Color Scheme
- Primary: `#2D7D46` (Green)
- Secondary: `#52634F`
- Error: `#BA1A1A`
- Surface: `#F8F8F8`

### Navigation
- Bottom Navigation Bar: Clientes | Serviços | Estoque
- Top App Bar: User info, Profile, Logout

## 🔐 Authentication

- JWT token stored in SharedPreferences
- Auto-login on app start
- Token refresh mechanism
- Biometric authentication (future)

## 📡 API Endpoints

Base URL: `http://localhost:8080/api`

- `POST /auth/login` - Login
- `GET /clients` - List clients
- `GET /clients/search?name=&cpf=&city=` - Search clients
- `POST /clients` - Create client
- `PUT /clients/{id}` - Update client
- `GET /services` - List services
- `POST /services` - Create service
- `GET /products` - List products
- `POST /stock-movements` - Create stock movement

## ✅ Pre-Flight Checklist

Before starting development:
- [ ] Flutter SDK installed
- [ ] `flutter doctor` shows no critical issues
- [ ] Android Studio or VS Code ready
- [ ] Emulator created or physical device connected
- [ ] Backend API running on `http://localhost:8080`

## 🧪 Testing

```bash
# Run tests
flutter test

# Run with coverage
flutter test --coverage
```

## 📦 Build

```bash
# Build APK
flutter build apk

# Build App Bundle
flutter build appbundle

# Build for iOS (macOS only)
flutter build ios
```

## 👥 Demo Users

- **Admin:** `admin` / `password`
- **Veterinarian:** `vet` / `password`
- **Receptionist:** `recep` / `password`

## 📝 Notes

- App is in Portuguese (Brazilian)
- Supports Android 5.0+ (API 21+)
- Material Design 3
- Responsive layouts for tablets
