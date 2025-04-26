import { useState, useRef, useEffect } from "react";
import {Search, X} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchTermDefault: string;
}

export default function SearchBar({ searchTermDefault ,onSearch }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(Boolean(searchTermDefault) || false);
  const [searchTerm, setSearchTerm] = useState(searchTermDefault);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchTerm);
    }
  };

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if(searchTerm) return
      if (isExpanded && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleToggle}
        className="flex items-center justify-center  rounded-full  text-white "
        aria-label="Rechercher"
      >
        <Search size={32} strokeWidth={'1px'}  />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "240px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-15 z-15"
          >
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Rechercher..."
              className="w-full h-10 px-4 py-2 rounded-lg border border-gray-300
                        bg-white  text-gray-800
                        focus:outline-none "
            />
            {searchTerm && <X fill="black" className="absolute right-2 top-[11px] transform" size={20} onClick={()=>{
              setSearchTerm("")
              onSearch("")
            }}/>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
