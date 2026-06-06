import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  onPress: () => void;
};

export function BotaoSair({ onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.botao}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Sair da conta"
    >
      <Text style={styles.texto}>Sair</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  texto: {
    color: theme.colors.muted,
    fontSize: theme.font.label,
    fontWeight: theme.weight.semibold,
  },
});
