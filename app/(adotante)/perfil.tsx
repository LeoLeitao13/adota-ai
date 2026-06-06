import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BotaoSair } from '../../components/BotaoSair';
import { logout } from '../../services/auth';
import { theme } from '../../constants/theme';

export default function PerfilScreen() {
  const router = useRouter();

  const handleSair = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <View style={styles.cabecalhoInfo}>
          <Text style={styles.titulo}>Meu perfil</Text>
        </View>
        <BotaoSair onPress={handleSair} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: theme.spacing.xxxl,
  },
  cabecalho: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cabecalhoInfo: {
    flex: 1,
  },
  titulo: {
    fontSize: theme.font.title,
    fontWeight: theme.weight.bold,
    color: theme.colors.text,
  },
});
