import Hapi from '@hapi/hapi';
import { nanoid } from 'nanoid';

const books = [];

const init = async () => {
  const server = Hapi.server({
    port: 9000,
    host: 'localhost',
  });

  server.route([
    {
      method: 'POST',
      path: '/books',
      handler: (request, h) => {
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

        if (!name) {
          return h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
          }).code(400);
        }

        if (readPage > pageCount) {
          return h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
          }).code(400);
        }

        const id = nanoid(16);
        const finished = pageCount === readPage;
        const insertedAt = new Date().toISOString();
        const updatedAt = insertedAt;

        const newBook = {
          id,
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          finished,
          reading,
          insertedAt,
          updatedAt,
        };

        books.push(newBook);

        return h.response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        }).code(201);
      },
    },
    {
      method: 'GET',
      path: '/books',
      handler: (request, h) => {
        return h.response({
          status: 'success',
          data: {
            books: books.map(book => {
              return {
                id: book.id,
                name: book.name,
                publisher: book.publisher,
              };
            }),
          },
        }).code(200);
      },
    },
    {
      method: 'GET',
      path: '/books/{bookId}',
      handler: (request, h) => {
        const { bookId } = request.params;
    
        const book = books.find(book => book.id === bookId);
    
        if (book) {
          const {
            id,
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            insertedAt,
            updatedAt
          } = book;
    
          const finished = readPage === pageCount;
    
          return h.response({
            status: 'success',
            data: { book }
          }).code(200);
        }
    
        return h.response({
          status: 'fail',
          message: 'Buku tidak ditemukan'
        }).code(404);
      }
    },
    {
      method: 'PUT',
      path: '/books/{bookId}',
      handler: (request, h) => {
        const { bookId } = request.params;
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

        const bookIndex = books.findIndex(book => book.id === bookId);

        if (bookIndex !== -1) {
          if (!name) {
            return h.response({
              status: 'fail',
              message: 'Gagal memperbarui buku. Mohon isi nama buku',
            }).code(400);
          }

          if (readPage > pageCount) {
            return h.response({
              status: 'fail',
              message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            }).code(400);
          }

          books[bookIndex] = {
            ...books[bookIndex],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            reading,
            updatedAt: new Date().toISOString(),
          };

          return h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
          }).code(200);
        }

        return h.response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);
      },
    },
    {
      method: 'DELETE',
      path: '/books/{bookId}',
      handler: (request, h) => {
        const { bookId } = request.params;

        const bookIndex = books.findIndex(book => book.id === bookId);

        if (bookIndex !== -1) {
          books.splice(bookIndex, 1);

          return h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
          }).code(200);
        }

        return h.response({
          status: 'fail',
          message: 'Buku gagal dihapus. Id tidak ditemukan',
        }).code(404);
      },
    },
  ]);

  await server.start();
  console.log(`Server: ${server.info.uri}`);
};

init();
