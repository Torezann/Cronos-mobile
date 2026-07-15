import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useItems } from '@/hooks/useItems';
import type { Item } from '@/lib/db/schema';

export default function HomeScreen() {
  const { items, addItem, clearItems } = useItems();
  const [name, setName] = useState('');

  const handleAdd = async () => {
    await addItem(name);
    setName('');
  };

  return (
    <View className="flex-1 bg-background px-4 pt-16">
      <Text className="mb-1 text-3xl font-bold text-foreground">Cronos</Text>
      <Text className="mb-6 text-sm text-muted-foreground">
        Expo + NativeWind + Reusables + Drizzle/SQLite, 100% offline.
      </Text>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Novo item</CardTitle>
        </CardHeader>
        <CardContent className="flex-row gap-2">
          <Input
            className="flex-1"
            placeholder="Nome do item"
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <Button onPress={handleAdd} disabled={!name.trim()}>
            <Text>Adicionar</Text>
          </Button>
        </CardContent>
      </Card>

      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">Itens salvos ({items.length})</Text>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onPress={clearItems}>
            <Text>Limpar</Text>
          </Button>
        )}
      </View>

      <FlatList<Item>
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 32, gap: 8 }}
        ListEmptyComponent={
          <Text className="text-center text-muted-foreground">
            Nenhum item ainda. Adicione o primeiro acima.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <CardContent className="flex-row items-center justify-between py-4">
              <Text className="text-base text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted-foreground">#{item.id}</Text>
            </CardContent>
          </Card>
        )}
      />
    </View>
  );
}
