let currentSearchString = '';
let liSelected = null;
const input = document.getElementById('searchInput');
const suggestionList = document.getElementById('searchSuggestionList');

input.addEventListener("keydown", function(event) {
    const searchString = event.target.value;
    if(event.keyCode === 13) {
        search(searchString);
    } 
});

input.addEventListener("keyup", function(event) {
    const searchString = event.target.value;
    if (currentSearchString !== searchString) {
        currentSearchString = searchString;
        suggestion(searchString);
    }
});

document.addEventListener("click", function(event) {
    if(event.target.tagName !== 'LI' && event.target.tagName !== 'INPUT') {
        clearInput();
        clearSuggestionChildren();
    }
});

document.addEventListener("keydown", function(event) {
    const li = liSelected || document.getElementsByClassName('search__suggestion')[0];    
    if(event.keyCode === 40){
        if(liSelected) {
            liSelected.classList.remove('search__suggestion--selected');
            next = liSelected.nextSibling;
            next ? setSelectedSuggestion(next) : setSelectedSuggestion(li);
        } else {
            setSelectedSuggestion(li);
        }
    } else if (event.keyCode === 38){
        if(liSelected) {
            liSelected.classList.remove('search__suggestion--selected');
            prev = liSelected.previousSibling
            prev ? setSelectedSuggestion(prev) : setSelectedSuggestion(li);
        } else {
            setSelectedSuggestion(li);
        }
    }
});

document.addEventListener("mouseover", function(event) {
    if(event.target.classList.contains('search__suggestion')) {
        if(liSelected) 
        {
            liSelected.classList.remove('search__suggestion--selected');
        }
        setSelectedSuggestion(event.target);

        liSelected.addEventListener("mouseleave", function(event) {            
            liSelected.classList.remove('search__suggestion--selected');          
        });
    }    
});

function clearInput() {
    input.value = '';    
}

function clearSuggestionChildren() {
    while (suggestionList.firstChild) {
        suggestionList.removeChild(suggestionList.firstChild);
    }
    liSelected = null;
}

function createRemoveButton() {
    const button = document.createElement('button');    
    button.className = "search__result-delete";
    button.addEventListener('click', function (event) {
        const toRemove = event.srcElement.parentNode;
        toRemove.parentNode.removeChild(toRemove);
    });

    return button;
}

function createSearchResult(searchString) {
    const searchResults = document.getElementById('searchResultList');    
    const result = document.createElement('li');
    const dateString = getDateString();
    const textSpan = document.createElement('p');
    const dateSpan = document.createElement('p');    
    const text = document.createTextNode(searchString);
    const date = document.createTextNode(dateString);

    textSpan.appendChild(text);
    textSpan.className = "search_result-content";
    dateSpan.appendChild(date);
    dateSpan.className = "search_result-content search_result-content--date";

    result.className = "search__result";
    result.appendChild(textSpan);
    result.appendChild(dateSpan);
    result.appendChild(createRemoveButton());

    searchResults.appendChild(result);
}

function createSuggestion(search) {
    const result = document.createElement('li');
    const text = document.createTextNode(search);
    result.className = "search__suggestion";
    result.appendChild(text);
    result.addEventListener('click', function (event) {
        createSearchResult(event.target.textContent);
        clearInput();
        clearSuggestionChildren();
    });
    searchSuggestionList.appendChild(result);
}

function getDateString() {
    const now = new Date();
    const day = (now.getDate() < 10 ? '0' : '') + now.getDate();
    const month = ((now.getMonth() + 1) < 10 ? '0' : '') + (now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = (now.getHours() < 10 ? '0' : '') + now.getHours();
    const minutes = (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getSuggestions(searchString) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "http://swapi.co/api/people/?search=" + searchString, true);
    xhr.send();
    xhr.onload = function (event) {
        if (xhr.readyState === 4) {
            clearSuggestionChildren();            
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.response);
                response.results.forEach(function (character) {
                    createSuggestion(character.name);
                });
            } else {
                console.error(xhr.statusText);
            }
        }
    };
}

function search(searchString) {
    if (liSelected) {
        createSearchResult(liSelected.innerHTML);        
    } else if (document.getElementById('searchSuggestionList').firstChild) {
        createSearchResult(document.getElementById('searchSuggestionList').firstChild.innerHTML);
    } else {
        createSearchResult(searchString);
    }
    clearInput();
    clearSuggestionChildren();
}

function setSelectedSuggestion(elem) {
    elem.classList.add('search__suggestion--selected');
    liSelected = elem;
}

function suggestion(searchString) {
    if(!searchString) {
        clearSuggestionChildren();   
        return;       
    }
    getSuggestions(searchString);
}
