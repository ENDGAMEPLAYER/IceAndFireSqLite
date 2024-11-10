import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite/legacy';
import Toast from 'react-native-toast-message';

const db = SQLite.openDatabase('characters.db');

const HomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const initializeDatabaseAndFetchData = async () => {
      try {
        await createTable();
        await fetchData();
        await fetchDataFromSQLite();
      } catch (error) {
        console.log('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDatabaseAndFetchData();
  }, []);

  // Create table if it doesn't exist
  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS characters (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          name TEXT, 
          gender TEXT, 
          culture TEXT, 
          born TEXT, 
          died TEXT,
          titles TEXT,
          aliases TEXT,
          allegiances TEXT,
          books TEXT,
          father TEXT,
          mother TEXT,
          spouse TEXT,
          povBooks TEXT,
          tvSeries TEXT,
          playedBy TEXT
        );`,
        [],
        () => console.log('Table created successfully'),
        (error) => console.log('Error creating table', error)
      );
    });
  };

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const urls = [
        'https://anapioficeandfire.com/api/characters/300',
        'https://anapioficeandfire.com/api/characters/301',
        'https://anapioficeandfire.com/api/characters/302',
        'https://anapioficeandfire.com/api/characters/303',
      ];

      const responses = await Promise.all(urls.map(url => fetch(url)));
      const jsonData = await Promise.all(responses.map(res => res.json()));

      console.log("Fetched Data from API:", jsonData);

      saveDataToSQLite(jsonData);
    } catch (error) {
      console.log('Error fetching data', error);
    }
  };

  const saveDataToSQLite = (characters) => {
    db.transaction(tx => {
      characters.forEach(character => {
        tx.executeSql(
          `INSERT INTO characters (name, gender, culture, born, died, titles, aliases, allegiances, books, father, mother, spouse, povBooks, tvSeries, playedBy) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            character.name || 'Unknown',
            character.gender || 'N/A',
            character.culture || 'N/A',
            character.born || 'N/A',
            character.died || 'N/A',
            character.titles.join(', ') || 'N/A',
            character.aliases.join(', ') || 'N/A',
            character.allegiances.join(', ') || 'N/A',
            character.books.join(', ') || 'N/A',
            character.father || 'N/A',
            character.mother || 'N/A',
            character.spouse || 'N/A',
            character.povBooks.join(', ') || 'N/A',
            character.tvSeries.join(', ') || 'N/A',
            character.playedBy.join(', ') || 'N/A'
          ],
          () => {
            console.log("Character inserted:", character.name);
            Toast.show({
              type: 'success',
              position: 'bottom',
              text1: 'Data Inserted Successfully',
            });
          },
          (error) => console.log('Error saving character', error)
        );
      });
    });
  };

  const fetchDataFromSQLite = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM characters;',
        [],
        (_, { rows }) => {
          console.log("Data fetched from SQLite:", rows._array);
          setData(rows._array);
        },
        (error) => console.log('Error fetching data from SQLite', error)
      );
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name || 'Unknown'}</Text>
      <Text>Gender: {item.gender || 'N/A'}</Text>
      <Text>Culture: {item.culture || 'N/A'}</Text>
      <Text>Born: {item.born || 'N/A'}</Text>
      <Text>Died: {item.died || 'N/A'}</Text>
      <Text>Titles: {item.titles || 'N/A'}</Text>
      <Text>Aliases: {item.aliases || 'N/A'}</Text>
      <Text>Allegiances: {item.allegiances || 'N/A'}</Text>
      <Text>Books: {item.books || 'N/A'}</Text>
      <Text>Father: {item.father || 'N/A'}</Text>
      <Text>Mother: {item.mother || 'N/A'}</Text>
      <Text>Spouse: {item.spouse || 'N/A'}</Text>
      <Text>POV Books: {item.povBooks || 'N/A'}</Text>
      <Text>TV Series: {item.tvSeries || 'N/A'}</Text>
      <Text>Played By: {item.playedBy || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
