document.addEventListener('DOMContentLoaded', function() {
  // Submit Form
  const formSubmit = document.getElementById('form');
  formSubmit.addEventListener('submit', function(event) {
    event.preventDefault();
    addBook();
  });

  // Filter Form
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    filterBook();
  });

  if(storageIsAvailable()) {
    loadDataFromStorage();
  }

  hideContent();
});

const RENDER_BOOK = 'book-data';
const books = [];

document.addEventListener(RENDER_BOOK, function() {
  const uncompletedBooks = document.getElementById('uncomplete-books');
  uncompletedBooks.innerHTML = '';

  const completeBooks = document.getElementById('complete-books');
  completeBooks.innerHTML = '';

  for(const book of books) {
    const bookItem = createBookList(book);

    if(!book.isComplete) {
      uncompletedBooks.append(bookItem);
    } else {
      completeBooks.append(bookItem);
    }
  }
});

function hideContent() {
  const containerBookItem = document.querySelector('.booklist-container');
  const containerSearchItem = document.querySelector('.search-booklist--container');
  if(books.length === 0) {
    containerBookItem.classList.add('hidden');
    containerSearchItem.classList.add('hidden');
  }else {
    containerBookItem.classList.remove('hidden');
    containerSearchItem.classList.remove('hidden');
  }

  document.dispatchEvent(new Event(RENDER_BOOK));
}

function addBook() {
  const id = generateId();
  const title = document.getElementById('judul').value;
  const author = document.getElementById('penulis').value;
  const year = document.getElementById('tahun').value;
  const isComplete = document.getElementById('is-complete').checked;
  const bookObj = createBookObject(id, title, author, year, isComplete);
  books.push(bookObj);

  document.dispatchEvent(new Event(RENDER_BOOK));
  saveStorage();
  hideContent();
}

function filterBook() {
  const uncompletedBooks = document.getElementById('uncomplete-books');
  uncompletedBooks.innerHTML = '';

  const completeBooks = document.getElementById('complete-books');
  completeBooks.innerHTML = '';

  const searchInput = document.querySelector('#search-input').value.toLowerCase();
  books.filter(book => {
    if(book.title.toLowerCase().includes(searchInput)) {
      const bookFiltered = createBookList(book);
      if(book.isComplete) {
        completeBooks.append(bookFiltered);
      } else {{
        uncompletedBooks.append(bookFiltered);
      }}
    }
  });
}

function generateId() {
  return + new Date();
}

function createBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function createBookList(book) {
  const textTitle = document.createElement('h4');
  textTitle.classList.add('bookitem--header');
  textTitle.innerText = book.title;

  const textAuthor = document.createElement('p');
  textAuthor.classList.add('bookitem--author');
  textAuthor.innerText = book.author;

  const textYear = document.createElement('p');
  textYear.classList.add('bookitem--year');
  textYear.innerText = book.year;

  const textContainer = document.createElement('div');
  textContainer.setAttribute('class', 'bookitem--teks')
  textContainer.append(textTitle, textAuthor, textYear);
  
  const container = document.createElement('div');
  container.classList.add('bookitem')
  container.append(textContainer);

  if(!book.isComplete) {
    const imgAdd = `<img src="./assets/images/add-dark.svg" onmouseover="this.src='./assets/images/add-light.svg'" onmouseleave="this.src='./assets/images/add-dark.svg'" alt="add">`;
    const imgTrash = `<img src="./assets/images/trash-dark.svg" onmouseover="this.src='./assets/images/trash-light.svg'" onmouseleave="this.src='./assets/images/trash-dark.svg'" alt="trash">`;

    const addCompleteButton = document.createElement('button');
    addCompleteButton.classList.add('button');
    addCompleteButton.setAttribute('id', 'add-complete-button');
    addCompleteButton.innerHTML = imgAdd;
    addCompleteButton.addEventListener('click', function() {
      addBookToComplete(book);
    });

    const removeButton = document.createElement('button');
    removeButton.classList.add('button');
    removeButton.setAttribute('id', 'remove-button');
    removeButton.innerHTML = imgTrash;
    removeButton.addEventListener('click', function() {
      removeBook(book);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('bookitem--button');
    buttonContainer.append(addCompleteButton, removeButton);

    container.append(buttonContainer);
  } else {
    const imgUndo = `<img src="./assets/images/undo-dark.svg" onmouseover="this.src='./assets/images/undo-light.svg'" onmouseleave="this.src='./assets/images/undo-dark.svg'" alt="add">`;
    const imgTrash = `<img src="./assets/images/trash-dark.svg" onmouseover="this.src='./assets/images/trash-light.svg'" onmouseleave="this.src='./assets/images/trash-dark.svg'" alt="trash">`;

    const undoCompleteButton = document.createElement('button');
    undoCompleteButton.classList.add('button');
    undoCompleteButton.setAttribute('id', 'undo-complete-button');
    undoCompleteButton.innerHTML = imgUndo;
    undoCompleteButton.addEventListener('click', function() {
      undoBookFromComplete(book);
    });

    const removeButton = document.createElement('button');
    removeButton.classList.add('button');
    removeButton.setAttribute('id', 'remove-button');
    removeButton.innerHTML = imgTrash;
    removeButton.addEventListener('click', function() {
      removeBook(book);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('bookitem--button');
    buttonContainer.append(undoCompleteButton, removeButton);

    container.append(buttonContainer);
  }

  return container;
}

function findBook(id) {
  for(const book of books) {
    if(book.id === id) {
      return book;
    }
  }

  return null;
}

function findBookIndex(id) {
  for(const index in books){
    if(books[index].id === id) {
      return index;
    }
  }

  return -1;
}

function addBookToComplete({id}) {
  const bookTarget = findBook(id);

  if(bookTarget === null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveStorage();
  hideContent();
}

function undoBookFromComplete({id}) {
  const bookTarget = findBook(id);

  if(bookTarget === null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveStorage();
  hideContent();
}

function removeBook({id}) {
  const bookTarget = findBookIndex(id);

  if(bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_BOOK));
  saveStorage();
  hideContent();
}

// LocalStorage
const BOOK_KEY = 'book-data';
const RENDER_SAVED_BOOK = 'saved-book';

document.addEventListener(RENDER_SAVED_BOOK, function() {
  console.log(localStorage.getItem(BOOK_KEY));
});

function storageIsAvailable() {
  if(typeof(Storage) === undefined) {
    alert('Maaf browser Anda tidak support penggunaan web storage.');
    return false;
  }

  return true;
}

function saveStorage() {
  if(storageIsAvailable()) {
    const bookDataString = JSON.stringify(books);
    localStorage.setItem(BOOK_KEY, bookDataString);

    document.dispatchEvent(new Event(RENDER_SAVED_BOOK));
  }
}

function loadDataFromStorage() {
  const bookDataParsed = localStorage.getItem(BOOK_KEY);
  const datas = JSON.parse(bookDataParsed);

  if(datas !== null) {
    for(const data of datas) {
      books.push(data);
    }
  }

  document.dispatchEvent(new Event(RENDER_BOOK));
}