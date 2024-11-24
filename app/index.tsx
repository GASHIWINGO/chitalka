import React, { useState, useRef, useEffect } from "react";
import { Text, View, Button, FlatList, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent, TouchableOpacity, AppState, StyleSheet, StatusBar } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  initDatabase, 
  addBook, 
  getAllBooks, 
  getBookByName, 
  updateBook, 
  removeBookFromDB,
  BookDB,
  BOOKS_KEY
} from './database';
import DebugScreen from './components/DebugScreen';

// Добавляем тип для тем
type Theme = 'light' | 'dark' | 'sepia';

// Обновляем объект с настройками тем
const themeStyles = {
  light: {
    background: '#FFFFFF',
    text: '#2C3E50',
    header: '#F8F9FA',
    border: '#E9ECEF',
    button: '#007AFF',
    buttonText: '#FFFFFF',
    card: '#FFFFFF',
    cardBorder: '#E9ECEF',
    secondaryText: '#6C757D'
  },
  dark: {
    background: '#1A1A1A',
    text: '#F8F9FA',
    header: '#2C3E50',
    border: '#2C3E50',
    button: '#0A84FF',
    buttonText: '#FFFFFF',
    card: '#2C3E50',
    cardBorder: '#34495E',
    secondaryText: '#ADB5BD'
  },
  sepia: {
    background: '#F4ECD8',
    text: '#5B4636',
    header: '#E4D5B7',
    border: '#D4C5A7',
    button: '#8B7355',
    buttonText: '#FFFFFF',
    card: '#FDF6E3',
    cardBorder: '#D4C5A7',
    secondaryText: '#7F6B5C'
  }
};

// Определяем тип для таблицы кодировки
const windows1251: { [key: number]: number } = {
  0x00: 0x0000,
  0x01: 0x0001,
  0x02: 0x0002,
  0x03: 0x0003,
  0x04: 0x0004,
  0x05: 0x0005,
  0x06: 0x0006,
  0x07: 0x0007,
  0x08: 0x0008,
  0x09: 0x0009,
  0x0A: 0x000A,
  0x0B: 0x000B,
  0x0C: 0x000C,
  0x0D: 0x000D,
  0x0E: 0x000E,
  0x0F: 0x000F,
  0x80: 0x0402,
  0x81: 0x0403,
  0x82: 0x201A,
  0x83: 0x0453,
  0x84: 0x201E,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x20AC,
  0x89: 0x2030,
  0x8A: 0x0409,
  0x8B: 0x2039,
  0x8C: 0x040A,
  0x8D: 0x040C,
  0x8E: 0x040B,
  0x8F: 0x040F,
  0x90: 0x0452,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201C,
  0x94: 0x201D,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x0098,
  0x99: 0x2122,
  0x9A: 0x0459,
  0x9B: 0x203A,
  0x9C: 0x045A,
  0x9D: 0x045C,
  0x9E: 0x045B,
  0x9F: 0x045F,
  0xA0: 0x00A0,
  0xA1: 0x040E,
  0xA2: 0x045E,
  0xA3: 0x0408,
  0xA4: 0x00A4,
  0xA5: 0x0490,
  0xA6: 0x00A6,
  0xA7: 0x00A7,
  0xA8: 0x0401,
  0xA9: 0x00A9,
  0xAA: 0x0404,
  0xAB: 0x00AB,
  0xAC: 0x00AC,
  0xAD: 0x00AD,
  0xAE: 0x00AE,
  0xAF: 0x0407,
  0xB0: 0x00B0,
  0xB1: 0x00B1,
  0xB2: 0x0406,
  0xB3: 0x0456,
  0xB4: 0x0491,
  0xB5: 0x00B5,
  0xB6: 0x00B6,
  0xB7: 0x00B7,
  0xB8: 0x0451,
  0xB9: 0x2116,
  0xBA: 0x0454,
  0xBB: 0x00BB,
  0xBC: 0x0458,
  0xBD: 0x0405,
  0xBE: 0x0455,
  0xBF: 0x0457,
  0xC0: 0x0410,
  0xC1: 0x0411,
  0xC2: 0x0412,
  0xC3: 0x0413,
  0xC4: 0x0414,
  0xC5: 0x0415,
  0xC6: 0x0416,
  0xC7: 0x0417,
  0xC8: 0x0418,
  0xC9: 0x0419,
  0xCA: 0x041A,
  0xCB: 0x041B,
  0xCC: 0x041C,
  0xCD: 0x041D,
  0xCE: 0x041E,
  0xCF: 0x041F,
  0xD0: 0x0420,
  0xD1: 0x0421,
  0xD2: 0x0422,
  0xD3: 0x0423,
  0xD4: 0x0424,
  0xD5: 0x0425,
  0xD6: 0x0426,
  0xD7: 0x0427,
  0xD8: 0x0428,
  0xD9: 0x0429,
  0xDA: 0x042A,
  0xDB: 0x042B,
  0xDC: 0x042C,
  0xDD: 0x042D,
  0xDE: 0x042E,
  0xDF: 0x042F,
  0xE0: 0x0430,
  0xE1: 0x0431,
  0xE2: 0x0432,
  0xE3: 0x0433,
  0xE4: 0x0434,
  0xE5: 0x0435,
  0xE6: 0x0436,
  0xE7: 0x0437,
  0xE8: 0x0438,
  0xE9: 0x0439,
  0xEA: 0x043A,
  0xEB: 0x043B,
  0xEC: 0x043C,
  0xED: 0x043D,
  0xEE: 0x043E,
  0xEF: 0x043F,
  0xF0: 0x0440,
  0xF1: 0x0441,
  0xF2: 0x0442,
  0xF3: 0x0443,
  0xF4: 0x0444,
  0xF5: 0x0445,
  0xF6: 0x0446,
  0xF7: 0x0447,
  0xF8: 0x0448,
  0xF9: 0x0449,
  0xFA: 0x044A,
  0xFB: 0x044B,
  0xFC: 0x044C,
  0xFD: 0x044D,
  0xFE: 0x044E,
  0xFF: 0x044F,
};

const decode1251 = (buffer: Uint8Array): string => {
  let result = '';
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte < 0x80) {
      result += String.fromCharCode(byte);
    } else {
      result += String.fromCharCode(windows1251[byte] || byte);
    }
  }
  return result;
};

// Добавляем стили для основного списка
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  bookList: {
    paddingHorizontal: 20
  },
  bookCard: {
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  bookInfo: {
    flex: 1
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5
  },
  bookProgress: {
    fontSize: 12,
    marginBottom: 8
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  }
});

// Добавляем стили для экрана чтения
const readerStyles = StyleSheet.create({
  readerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  readerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  readerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  readerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  themeButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  themeButtonText: {
    fontSize: 16
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '600'
  },
  readerContent: {
    flex: 1,
    padding: 20
  },
  bookText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    paddingBottom: 20
  }
});

export default function App() {
  const [files, setFiles] = useState<BookDB[]>([]);
  const [currentBook, setCurrentBook] = useState<string | null>(null);
  const [bookContent, setBookContent] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);

  useEffect(() => {
    const initApp = async () => {
      await initDatabase();
      const savedBooks = await getAllBooks();
      setFiles(savedBooks);
    };
    initApp();
  }, []);

  useEffect(() => {
    const checkExistingBooks = async () => {
      const books = await getAllBooks();
      let needUpdate = false;
      const existingBooks = [];

      for (const book of books) {
        const fileExists = await FileSystem.getInfoAsync(book.filePath);
        if (fileExists.exists) {
          existingBooks.push(book);
        } else {
          needUpdate = true;
        }
      }

      if (needUpdate) {
        await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(existingBooks));
        setFiles(existingBooks);
      }
    };

    // Проверяем при запуске приложения
    checkExistingBooks();

    // Проверяем каждый раз при возвращении приложения из фона
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkExistingBooks();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAddBook = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/*',
        copyToCacheDirectory: true
      });
      
      if (result.assets && result.assets[0]) {
        const existingBook = await getBookByName(result.assets[0].name);
        if (existingBook) {
          alert('Эта книга уже добавлена');
          return;
        }

        const encoding = await detectEncoding(result.assets[0].uri);

        const newBook: BookDB = {
          name: result.assets[0].name,
          currentPage: 1,
          totalPages: 1,
          filePath: result.assets[0].uri,
          encoding: encoding,
          textPosition: 0
        };

        await addBook(newBook);
        const books = await getAllBooks();
        setFiles(books);
      }
    } catch (err) {
      console.log("Error picking document:", err);
      alert(err instanceof Error ? err.message : "Ошибка при добавлении книги");
    }
  };

  const detectEncoding = async (uri: string): Promise<'UTF-8' | 'Windows-1251'> => {
    const base64Content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    try {
      const utf8Content = decodeURIComponent(escape(atob(base64Content)));
      if (/[а-яА-Я]/.test(utf8Content)) {
        return 'UTF-8';
      }
    } catch (error) {
      const bytes = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
      const win1251Content = decode1251(bytes);
      if (/[а-яА-Я]/.test(win1251Content)) {
        return 'Windows-1251';
      }
    }
    
    return 'UTF-8';
  };

  const handleOpenBook = async (book: BookDB) => {
    try {
      // Проверяем существование файла
      const fileExists = await FileSystem.getInfoAsync(book.filePath);
      if (!fileExists.exists) {
        await removeBookFromDB(book.name);
        setFiles(prevFiles => prevFiles.filter(f => f.name !== book.name));
        alert('Файл книги не найден на устройстве');
        return;
      }

      let content = '';
      
      if (book.encoding === 'UTF-8') {
        content = await FileSystem.readAsStringAsync(book.filePath, {
          encoding: FileSystem.EncodingType.UTF8
        });
      } else {
        const base64Content = await FileSystem.readAsStringAsync(book.filePath, {
          encoding: FileSystem.EncodingType.Base64
        });
        const bytes = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
        content = decode1251(bytes);
      }

      setBookContent(content);
      setCurrentBook(book.name);

      // Ждем следующего цикла для корректного расчета размеров
      setTimeout(() => {
        if (scrollViewRef.current) {
          const windowHeight = Dimensions.get('window').height - 100;
          
          // Вычисляем позицию скролла на основе сохраненной страницы
          const scrollPosition = (book.currentPage - 1) * windowHeight;
          
          // Устанавливаем текущую страницу
          setCurrentPage(book.currentPage);
          setTotalPages(book.totalPages);

          // Прокручиваем к сохраненной позиции
          scrollViewRef.current.scrollTo({ 
            y: scrollPosition, 
            animated: false 
          });
        }
      }, 100);

    } catch (err) {
      console.error("Error opening book:", err);
      alert("Произошла ошибка при открытии книги");
    }
  };

  const handleBackToList = async () => {
    if (currentBook) {
      const book = await getBookByName(currentBook);
      if (book) {
        // Сохраняем текущую страницу при выходе
        const updatedBook = {
          ...book,
          currentPage: Math.max(1, currentPage), // Убеждаемся, что страница не меньше 1
          totalPages: totalPages
        };
        await updateBook(updatedBook);

        // Обновляем список книг в UI
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.name === currentBook 
              ? { ...f, currentPage: Math.max(1, currentPage), totalPages: totalPages } 
              : f
          )
        );
      }
    }
    setCurrentBook(null);
    setBookContent('');
  };

  const handleScroll = async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const windowHeight = Dimensions.get('window').height - 100;
    
    setCurrentScrollPosition(offsetY);
    
    if (currentBook) {
      // Вычисляем текущую страницу
      const currentPageNumber = Math.max(1, Math.round(offsetY / windowHeight) + 1);
      const maxPages = Math.max(1, Math.ceil(contentHeight / windowHeight));
      
      // Проверяем, достигли ли мы конца книги
      const isLastPage = offsetY + windowHeight >= contentHeight - 20;
      const finalPage = isLastPage ? maxPages : Math.min(currentPageNumber, maxPages);

      if (finalPage !== currentPage) {
        setCurrentPage(finalPage);
        setTotalPages(maxPages);

        // Обновляем информацию в БД
        const book = await getBookByName(currentBook);
        if (book) {
          const updatedBook = {
            ...book,
            currentPage: finalPage,
            totalPages: maxPages
          };
          await updateBook(updatedBook);
          
          // Обновляем список книг
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.name === currentBook 
                ? { ...f, currentPage: finalPage, totalPages: maxPages } 
                : f
            )
          );
        }
      }
    }
  };

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'sepia'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  // Добавим функцию для обновления текущей страницы при изменении размера контента
  const handleContentSizeChange = async (width: number, height: number) => {
    const windowHeight = Dimensions.get('window').height - 100;
    const newTotalPages = Math.max(1, Math.ceil(height / windowHeight));
    
    if (newTotalPages !== totalPages) {
      setTotalPages(newTotalPages);
      
      // Обновляем информацию о книге только если это действительно новое значение
      if (currentBook) {
        const book = await getBookByName(currentBook);
        if (book) {
          const updatedBook = {
            ...book,
            totalPages: newTotalPages
          };
          await updateBook(updatedBook);
          
          setFiles(prevFiles => 
            prevFiles.map(f => 
              f.name === currentBook ? { ...f, totalPages: newTotalPages } : f
            )
          );
        }
      }
    }
  };

  // В начале компонента App добавляем эффект для обновления StatusBar при смене темы
  useEffect(() => {
    StatusBar.setBarStyle(currentTheme === 'dark' ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(themeStyles[currentTheme].background);
    StatusBar.setTranslucent(false); // отключаем прозрачность для корректного отображения цвета фона
  }, [currentTheme]);

  if (currentBook) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: themeStyles[currentTheme].background 
      }}>
        <StatusBar 
          backgroundColor={themeStyles[currentTheme].background}
          barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
          translucent={false}
        />
        <View style={[
          readerStyles.readerHeader, 
          { 
            backgroundColor: themeStyles[currentTheme].background,
            borderBottomColor: themeStyles[currentTheme].border 
          }
        ]}>
          <View style={readerStyles.readerControls}>
            <TouchableOpacity 
              style={[readerStyles.readerButton, { backgroundColor: themeStyles[currentTheme].button }]}
              onPress={handleBackToList}
            >
              <Text style={readerStyles.readerButtonText}>← Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={cycleTheme}
              style={[readerStyles.themeButton, { backgroundColor: themeStyles[currentTheme].button }]}
            >
              <Text style={readerStyles.themeButtonText}>
                {currentTheme === 'light' ? '☀️' : currentTheme === 'dark' ? '🌙' : '📖'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[readerStyles.pageInfo, { color: themeStyles[currentTheme].text }]}>
            {currentPage} / {totalPages}
          </Text>
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          style={[readerStyles.readerContent, { backgroundColor: themeStyles[currentTheme].background }]}
          contentContainerStyle={{ paddingBottom: 50 }}
          showsVerticalScrollIndicator={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
        >
          <Text style={[readerStyles.bookText, { color: themeStyles[currentTheme].text }]}>
            {bookContent}
          </Text>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: themeStyles[currentTheme].background,
      paddingTop: 20
    }}>
      <StatusBar 
        backgroundColor={themeStyles[currentTheme].background}
        barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeStyles[currentTheme].text }]}>
          Читалка
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: themeStyles[currentTheme].button }]}
          onPress={handleAddBook}
        >
          <Text style={styles.addButtonText}>+ Добавить книгу</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.bookList}
        data={files}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleOpenBook(item)}
            style={[
              styles.bookCard,
              { 
                backgroundColor: themeStyles[currentTheme].card,
                borderColor: themeStyles[currentTheme].cardBorder
              }
            ]}
          >
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle, { color: themeStyles[currentTheme].text }]}>
                {item.name.replace(/\.txt$/, '')}
              </Text>
              <Text style={[styles.bookProgress, { color: themeStyles[currentTheme].secondaryText }]}>
                Страница {item.currentPage} из {item.totalPages}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      backgroundColor: themeStyles[currentTheme].button,
                      width: `${(item.currentPage / item.totalPages) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.name}
      />
      <DebugScreen />
    </View>
  );
}