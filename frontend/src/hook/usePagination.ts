import {useState} from "react";

/**
 * Custom hook to handle pagination logic.
 */
export function usePagination(pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}) : [number, number, () => void, () => void, (page: number) => void]{

    const [page, setPage] = useState(1)

    function nextPage(){
        if(pagination?.hasNextPage === false) return console.warn('No more pages')
        setPage(page + 1)
    }

    function previousPage(){
        setPage(page - 1)
    }

    return [page, pagination?.pageSize || 10, nextPage, previousPage,setPage]
}