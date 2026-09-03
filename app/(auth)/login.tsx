import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { login } from '../../services/auth';
import { mensagemErroFirebase } from '../../services/firebase-errors';
import { theme } from '../../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 6;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const opacidade = useRef(new Animated.Value(0)).current;
  const deslocamento = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(deslocamento, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacidade, deslocamento]);

  const handleSubmit = async () => {
    setErro(null);
    if (!EMAIL_REGEX.test(email.trim())) {
      setErro('Informe um e-mail válido.');
      return;
    }
    if (senha.length < SENHA_MIN) {
      setErro(`A senha deve ter pelo menos ${SENHA_MIN} caracteres.`);
      return;
    }
    setCarregando(true);
    try {
      const usuario = await login(email.trim(), senha);
      if (usuario.tipo === 'ong') {
        router.replace('/(ong)/dashboard');
      } else {
        router.replace('/(adotante)/home');
      }
    } catch (e) {
      setErro(mensagemErroFirebase(e, 'login'));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.conteudo,
          {
            opacity: opacidade,
            transform: [{ translateY: deslocamento }],
          },
        ]}
      >
        <View style={styles.cabecalho}>
          <Text style={styles.logo}>🐾</Text>
          <Text style={styles.tituloApp}>Adota AI</Text>
          <Text style={styles.subtituloApp}>
            Encontre seu companheiro ideal
          </Text>
        </View>

        <View style={styles.cartao}>
          <Text style={styles.tituloForm}>Entrar</Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!carregando}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor={theme.colors.placeholder}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            editable={!carregando}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <TouchableOpacity
            style={styles.botao}
            onPress={handleSubmit}
            disabled={carregando}
            activeOpacity={0.85}
          >
            {carregando ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.botaoTexto}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/register" style={styles.link}>
            Não tem conta? Cadastre-se
          </Link>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: theme.colors.primaryLight,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  conteudo: {
    width: '100%',
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: theme.font.logo,
    marginBottom: theme.spacing.sm,
  },
  tituloApp: {
    fontSize: theme.font.hero,
    fontWeight: theme.weight.bold,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  subtituloApp: {
    fontSize: theme.font.subtitle,
    color: theme.colors.muted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  cartao: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  tituloForm: {
    fontSize: theme.font.title,
    fontWeight: theme.weight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: theme.font.subtitle,
  },
  erro: {
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  botao: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  botaoTexto: {
    color: theme.colors.white,
    fontWeight: theme.weight.semibold,
    fontSize: theme.font.subtitle,
  },
  link: {
    marginTop: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: theme.weight.medium,
  },
});
