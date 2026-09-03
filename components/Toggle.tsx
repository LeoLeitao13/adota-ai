import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  valor: boolean;
  texto: string;
  onChange: (v: boolean) => void;
};

/**
 * Checkbox estilizado com rótulo, usado para respostas
 * sim/não em formulários (ex: "Tenho crianças em casa").
 */
export function Toggle({ valor, texto, onChange }: Props) {
  return (
    <TouchableOpacity style={styles.toggle} onPress={() => onChange(!valor)}>
      <View style={valor ? styles.checkboxAtivo : styles.checkbox} />
      <Text style={styles.texto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
  },
  texto: {
    color: theme.colors.text,
    fontSize: theme.font.body,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  checkboxAtivo: {
    width: 22,
    height: 22,
    borderRadius: theme.radius.sm,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
});
