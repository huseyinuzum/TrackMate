import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onNavigateToRegister, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { theme, toggleTheme, themeColors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bgPrimary }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Text style={{ fontSize: 24 }}>{theme === 'dark' ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>TrackMate</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Akıllı Rota Planlama Asistanı</Text>
          </View>

          {error && (
            <View style={[styles.errorCard, { backgroundColor: themeColors.dangerBg, borderColor: themeColors.dangerColor }]}>
              <Text style={[styles.errorText, { color: themeColors.dangerColor }]}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>E-POSTA ADRESİ</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@domain.com"
                placeholderTextColor={themeColors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: themeColors.bgSecondary, borderColor: themeColors.borderColor, color: themeColors.textPrimary }]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeColors.textSecondary }]}>ŞİFRE</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={themeColors.textSecondary}
                secureTextEntry
                style={[styles.input, { backgroundColor: themeColors.bgSecondary, borderColor: themeColors.borderColor, color: themeColors.textPrimary }]}
              />
            </View>

            <TouchableOpacity 
              onPress={handleLogin} 
              disabled={loading}
              style={[styles.button, { backgroundColor: themeColors.accentColor, shadowColor: themeColors.accentColor }]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={[styles.link, { color: themeColors.accentColor }]}>Kayıt Olun</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  keyboardView: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 20,
    right: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 6,
  },
  errorCard: {
    padding: 16,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderRadius: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(2, 6, 23, 0.5)',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  link: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '600',
  },
});
