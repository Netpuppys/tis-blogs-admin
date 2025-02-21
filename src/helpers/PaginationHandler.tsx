import React, { Dispatch, SetStateAction, useState } from "react";

const PaginationHandler: React.FC<{
  totalResults: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
}> = ({ totalResults, setPageNumber }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage: number = 10;

  const totalPages: number = Math.ceil(totalResults / resultsPerPage);
  const startIndex: number = (currentPage - 1) * resultsPerPage + 1;
  const endIndex: number = Math.min(
    startIndex + resultsPerPage - 1,
    totalResults
  );

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageNumber((ps) => ps - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageNumber((ps) => ps + 1);
    }
  };

  const generatePageNumbers = (): (number | string)[] => {
    const maxPageButtons: number = 5; // Maximum number of visible page buttons
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const halfMaxButtons: number = Math.floor(maxPageButtons / 2);
      let startPage: number = currentPage - halfMaxButtons;
      let endPage: number = currentPage + halfMaxButtons;

      if (startPage < 1) {
        endPage += Math.abs(startPage) + 1;
        startPage = 1;
      } else if (endPage > totalPages) {
        startPage -= endPage - totalPages;
        endPage = totalPages;
      }

      if (startPage > 1) {
        pageNumbers.push(1, "...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages) {
        pageNumbers.push("...", totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <section className="flex mt-5 justify-between items-center">
      <div>{`${startIndex} - ${endIndex} of ${totalResults} results`}</div>
      <div>
        <ul className="flex gap-8">
          <li
            className={`page-item previous ${
              currentPage === 1 ? "disabled" : ""
            }`}
          >
            <button className="page- " onClick={handlePreviousClick}>
              <i className="previous"></i>
            </button>
          </li>
          {generatePageNumbers().map(
            (number: number | string, index: number) => (
              <li
                key={index}
                className={`page-item px-3 py-1 rounded-full ${
                  currentPage === number ? "active bg-black text-white" : ""
                }`}
                onClick={() => {
                  setCurrentPage(
                    typeof number === "number" ? number : currentPage
                  );
                  setPageNumber(Number(number));
                }}
              >
                <button className="page-link">{number}</button>
              </li>
            )
          )}
          <li
            className={`page-item next ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button className="page-link" onClick={handleNextClick}>
              <i className="next"></i>
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default PaginationHandler;
