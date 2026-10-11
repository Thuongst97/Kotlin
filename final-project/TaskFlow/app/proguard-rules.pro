# R8 shrinks and obfuscates release builds (lesson 20).
# Retrofit, OkHttp, Room, Hilt and kotlinx.serialization ship their own consumer rules.

# Keep serializers for our @Serializable network DTOs and navigation routes.
-keepclassmembers @kotlinx.serialization.Serializable class com.kotlinacademy.taskflow.** {
    *** Companion;
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class com.kotlinacademy.taskflow.**$$serializer { *; }

# Keep line numbers so crash reports from release builds are readable after retracing.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
