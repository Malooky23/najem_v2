import { useState } from 'react';
import { Button } from 'shadcn';

const ItemsTable = ({ items }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {paginatedItems.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between p-4">
        <Button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default ItemsTable;