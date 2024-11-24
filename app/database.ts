import AsyncStorage from '@react-native-async-storage/async-storage';

// Тип для книги в БД
export interface BookDB {
  id?: number;
  name: string;
  currentPage: number;
  totalPages: number;
  filePath: string;
  encoding: 'UTF-8' | 'Windows-1251';
  textPosition: number;
}

export const BOOKS_KEY = 'books_storage';

export const initDatabase = async (): Promise<void> => {
  try {
    const books = await AsyncStorage.getItem(BOOKS_KEY);
    if (!books) {
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const addBook = async (book: BookDB): Promise<void> => {
  try {
    const books = await getAllBooks();
    books.push(book);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const getAllBooks = async (): Promise<BookDB[]> => {
  try {
    const books = await AsyncStorage.getItem(BOOKS_KEY);
    return books ? JSON.parse(books) : [];
  } catch (error) {
    console.error('Error getting all books:', error);
    throw error;
  }
};

export const getBookByName = async (name: string): Promise<BookDB | null> => {
  try {
    const books = await getAllBooks();
    const book = books.find(b => b.name === name);
    return book || null;
  } catch (error) {
    console.error('Error getting book by name:', error);
    throw error;
  }
};

export const updateBook = async (updatedBook: BookDB): Promise<void> => {
  try {
    const books = await getAllBooks();
    const index = books.findIndex(b => b.name === updatedBook.name);
    if (index !== -1) {
      books[index] = updatedBook;
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
};

export const removeBookFromDB = async (bookName: string): Promise<void> => {
  try {
    const books = await getAllBooks();
    const updatedBooks = books.filter(book => book.name !== bookName);
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(updatedBooks));
  } catch (error) {
    console.error('Error removing book from DB:', error);
    throw error;
  }
};

// Создаем объект с всеми экспортами для дефолтного экспорта
const database = {
  initDatabase,
  addBook,
  getAllBooks,
  getBookByName,
  updateBook,
  removeBookFromDB,
  BOOKS_KEY
};

export default database; 