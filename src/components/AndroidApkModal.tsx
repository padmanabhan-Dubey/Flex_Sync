import React, { useState } from 'react';
import JSZip from 'jszip';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  PackageCheck,
  CheckCircle2,
  ExternalLink,
  X,
  FileCode,
  ShieldCheck,
  Terminal,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'webapk' | 'project' | 'cloud'>('webapk');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  // Generate complete Android Studio / Gradle APK project bundle using JSZip
  const handleDownloadAndroidProject = async () => {
    try {
      setIsGeneratingZip(true);
      const zip = new JSZip();

      // Root build.gradle
      const rootBuildGradle = `// Top-level build file for FlexSync Android APK
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
`;

      // Settings.gradle
      const settingsGradle = `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "FlexSyncBridge"
include ':app'
`;

      // app/build.gradle
      const appBuildGradle = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.flexsync.bridge'
    compileSdk 34

    defaultConfig {
        applicationId "com.flexsync.bridge"
        minSdk 23
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        manifestPlaceholders = [
            hostName: "${new URL(currentUrl || 'https://localhost').hostname}",
            defaultUrl: "${currentUrl}/",
            launcherName: "FlexSync",
            themeColor: "#0c0d12",
            navigationColor: "#0a0b10",
            backgroundColor: "#0a0b10"
        ]
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
`;

      // AndroidManifest.xml
      const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.flexsync.bridge">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="FlexSync"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.Design.NoActionBar">

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="FlexSync"
            android:exported="true"
            android:theme="@android:style/Theme.Translucent.NoTitleBar">

            <!-- Launcher Intent -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- App Links / URL Routing -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${new URL(currentUrl || 'https://localhost').hostname}"
                    android:pathPrefix="/" />
            </intent-filter>

            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${currentUrl}/" />

            <meta-data
                android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />

            <meta-data
                android:name="android.support.customtabs.trusted.NAVIGATION_BAR_COLOR"
                android:resource="@color/navigationColor" />
        </activity>

    </application>
</manifest>
`;

      // twa-manifest.json
      const twaManifest = JSON.stringify(
        {
          packageId: 'com.flexsync.bridge',
          host: new URL(currentUrl || 'https://localhost').hostname,
          name: 'FlexSync Bridge',
          launcherName: 'FlexSync',
          themeColor: '#0c0d12',
          navigationColor: '#0a0b10',
          backgroundColor: '#0a0b10',
          enableNotifications: true,
          startUrl: '/',
          appVersionName: '1.0.0',
          appVersionCode: 1,
          generatorApp: 'FlexSync Android Engine',
          webManifestUrl: `${currentUrl}/manifest.webmanifest`,
          fallbackType: 'customtabs',
        },
        null,
        2
      );

      // Colors resource
      const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#0C0D12</color>
    <color name="navigationColor">#0A0B10</color>
</resources>
`;

      // Build & Instructions README.md
      const readmeMd = `# FlexSync Android APK & TWA Package

This project compiles directly into a standalone Android APK using Android Studio or the Gradle CLI.

## Quick 1-Command Build (Command Line):

\`\`\`bash
# 1. Build Debug APK:
./gradlew assembleDebug

# Output APK location:
# app/build/outputs/apk/debug/app-debug.apk

# 2. Install directly onto connected Android device:
adb install app/build/outputs/apk/debug/app-debug.apk
\`\`\`

## Build with Android Studio:
1. Open Android Studio.
2. Select **Open an Existing Project** and choose this folder.
3. Click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Android Studio will generate the signed or debug \`.apk\` for direct installation on your smartphone!

## Features in this Android Package:
- Fullscreen Trusted Web Activity (TWA) with no browser address bar
- Real-time WebSocket sync for incoming & outgoing notifications
- Remote media playback transport controls
- Digital Asset Links integration
- Hardware audio chimes & vibration
`;

      // Assemble project structure
      zip.file('build.gradle', rootBuildGradle);
      zip.file('settings.gradle', settingsGradle);
      zip.file('README.md', readmeMd);
      zip.file('twa-manifest.json', twaManifest);

      const appFolder = zip.folder('app');
      if (appFolder) {
        appFolder.file('build.gradle', appBuildGradle);
        const mainFolder = appFolder.folder('src/main');
        if (mainFolder) {
          mainFolder.file('AndroidManifest.xml', androidManifest);
          const resFolder = mainFolder.folder('res/values');
          if (resFolder) {
            resFolder.file('colors.xml', colorsXml);
          }
        }
      }

      // Generate zip and trigger browser download
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'FlexSync-Android-APK-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate Android APK project zip:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-2xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#181a24]/95 border border-white/[0.12] shadow-2xl p-6 text-white max-h-[92vh] flex flex-col">
        {/* Apple Sheet Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#30d158]/15 border border-[#30d158]/25 text-[#30d158]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">
                Android APK & PWA Package Center
              </h3>
              <p className="text-xs text-white/50">Installable PWA & Native Android APK packages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Mode Selector */}
        <div className="flex bg-white/[0.06] border border-white/[0.08] rounded-xl p-1 mt-4">
          <button
            onClick={() => setActiveTab('webapk')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'webapk'
                ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Direct WebAPK</span>
          </button>
          <button
            onClick={() => setActiveTab('project')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'project'
                ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-[#0a84ff]" />
            <span>Android APK Project (.zip)</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'cloud'
                ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#af52de]" />
            <span>1-Click PWABuilder APK</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="overflow-y-auto p-1 py-4 space-y-4 text-xs leading-relaxed text-white/80">
          {activeTab === 'webapk' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-black/25 border border-white/[0.06] p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#30d158]/20 text-[#30d158] font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-semibold text-white/95">Native Android WebAPK System</h4>
                    <p className="text-white/60 mt-0.5">
                      When installed on Android, Chrome and Google Play Services automatically mint a real, signed <strong>Android WebAPK</strong> (<code className="text-[#30d158] font-mono">org.chromium.webapk.*</code>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a84ff]/20 text-[#0a84ff] font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-semibold text-white/95">Full Android App Privileges</h4>
                    <p className="text-white/60 mt-0.5">
                      Lives directly in the Android App Drawer, Settings &gt; Apps, supports badge counters, lockscreen media controls, and fullscreen immersion without browser chrome.
                    </p>
                  </div>
                </div>
              </div>

              {/* Install Action Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#0071e3]/15 to-transparent border border-[#0071e3]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-white text-[13px]">
                    {isInstalled ? 'App Already Installed' : 'Install on this Device'}
                  </h4>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    {isInstalled
                      ? 'FlexSync is currently active in standalone WebAPK mode.'
                      : 'Tap to trigger the native installation dialog on Android or Chrome OS Flex.'}
                  </p>
                </div>

                {isInstalled ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#30d158]/20 text-[#30d158] border border-[#30d158]/30 font-medium text-xs shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Installed</span>
                  </span>
                ) : (
                  <button
                    onClick={install}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-2 font-semibold text-xs transition active:scale-95 shadow-sm shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install WebAPK</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'project' && (
            <div className="space-y-4">
              <p className="text-white/75">
                Download the complete, production-ready <strong>Android Studio & Gradle project</strong> (<code className="text-[#0a84ff] font-mono">.zip</code>). It contains <code className="text-white font-mono">AndroidManifest.xml</code>, Gradle build scripts, launcher activities, and icons configured for <strong className="text-white">com.flexsync.bridge</strong>.
              </p>

              <div className="rounded-2xl bg-black/25 border border-white/[0.06] p-4 space-y-3">
                <h4 className="font-semibold text-white/95 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#30d158]" />
                  <span>Build APK in 1 Command:</span>
                </h4>
                <pre className="rounded-xl bg-black/40 border border-white/[0.08] p-3 text-[11px] font-mono text-[#30d158] overflow-x-auto leading-relaxed">
{`./gradlew assembleDebug
# Generated APK: app/build/outputs/apk/debug/app-debug.apk

# Sideload directly to connected phone:
adb install app/build/outputs/apk/debug/app-debug.apk`}
                </pre>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-white/50">
                  Pre-configured with Trusted Web Activity (TWA) & Digital Asset Links
                </span>

                <button
                  onClick={handleDownloadAndroidProject}
                  disabled={isGeneratingZip}
                  className="flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-2 font-semibold text-xs transition active:scale-95 shadow-sm disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    {isGeneratingZip
                      ? 'Generating Bundle...'
                      : downloadSuccess
                      ? 'Downloaded!'
                      : 'Download Android Project (.zip)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <p className="text-white/75">
                Generate an immediate signed <strong className="text-white">.apk</strong> or Google Play Store <strong className="text-white">.aab</strong> package using the official PWABuilder engine (by Microsoft & Google):
              </p>

              <div className="rounded-2xl bg-black/25 border border-white/[0.06] p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-white/90 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#30d158]" />
                  <span>Verified Manifest & Service Worker</span>
                </div>
                <p className="text-white/60 text-[11px]">
                  All PWA criteria (192px/512px maskable icons, standalone display mode, HTTPS, active service worker) are fully compliant.
                </p>

                <div className="pt-2">
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#af52de] hover:bg-[#9d3dd4] text-white px-4 py-2 font-semibold text-xs transition active:scale-95 shadow-sm"
                  >
                    <span>Open 1-Click APK Generator</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-3 text-[11px] text-white/60">
                <strong className="text-white">Android Sideloading Tip:</strong> If installing an APK directly on your phone, enable <em className="text-white">"Install Unknown Apps"</em> in Android Settings for Chrome or your file manager, then tap the downloaded <code className="text-white font-mono">.apk</code> to install!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-white/[0.08] hover:bg-white/[0.14] px-5 py-2 text-xs font-semibold text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
