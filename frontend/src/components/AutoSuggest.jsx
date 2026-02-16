import React, { useState, useEffect } from 'react';

const AutoSuggest = ({ fetchSuggestions, onSelect, inputValue, setInputValue, Setclass, placeholder }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [highlightIndex, setHighlightIndex] = useState(-1);

    useEffect(() => {
        if (!inputValue.trim() || inputValueMatchesSuggestion()) {
            // If inputValue is empty, contains only whitespace, or matches a suggestion, clear suggestions
            setSuggestions([]);
            return;
        }

        const loadSuggestions = async () => {
            const newSuggestions = await fetchSuggestions(inputValue);
            setSuggestions(newSuggestions);
        };

        loadSuggestions();
    }, [inputValue, fetchSuggestions]);

    const handleChange = (e) => {
        setInputValue(e.target.value); // Use the external setInputValue to update the input
    };

    const handleSelectSuggestion = (suggestion) => {
        setInputValue(suggestion.name); // Update input with the selected suggestion's name
        onSelect(suggestion); // Notify the parent component about the selection
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && highlightIndex >= 0) {
            handleSelectSuggestion(suggestions[highlightIndex]);
        }
    };

    const inputValueMatchesSuggestion = () => {
        return suggestions.some(suggestion => suggestion.name.toLowerCase() === inputValue.toLowerCase());
    };

    return (
        <div className="position-relative">
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Type to search..."}
                className={Setclass}
            />
            {!inputValueMatchesSuggestion() && suggestions.length > 0 && (
                <ul className="list-group mt-3" style={{ zIndex: 9999, position: 'absolute', backgroundColor: 'white', width: '100%' }}>
                    {suggestions.map((suggestion, index) => (
                        <li key={index}
                            className={`list-group-item ${index === highlightIndex ? 'active' : ''}`}
                            onClick={() => handleSelectSuggestion(suggestion)}>
                            {suggestion.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutoSuggest;
