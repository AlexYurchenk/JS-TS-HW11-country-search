import '@pnotify/core/dist/BrightTheme.css';
import '@pnotify/core/dist/PNotify.css';
import './sass/main.scss';
import { error } from '@pnotify/core';
const countryCardTemplate = require('./templates/country-card.hbs');
const countryListTemplate = require('./templates/country-list.hbs');
const input = document.querySelector('.js-input') as HTMLInputElement;
const container = document.querySelector('.js-container');
const BASE_URL = 'https://restcountries.com';

interface Flags {
    svg: string;
    png: string;
}

interface Currency {
    code: string;
    name: string;
    symbol: string;
}

interface Language {
    iso639_1: string;
    iso639_2: string;
    name: string;
    nativeName: string;
}

interface Translations {
    br: string;
    pt: string;
    nl: string;
    hr: string;
    fa: string;
    de: string;
    es: string;
    fr: string;
    ja: string;
    it: string;
    hu: string;
}

interface RegionalBloc {
    acronym: string;
    name: string;
    otherNames: string[];
    otherAcronyms: string[];
}

interface Country {
    name: string;
    topLevelDomain: string[];
    alpha2Code: string;
    alpha3Code: string;
    callingCodes: string[];
    capital: string;
    altSpellings: string[];
    subregion: string;
    region: string;
    population: number;
    latlng: number[];
    demonym: string;
    area: number;
    gini: number;
    timezones: string[];
    borders: string[];
    nativeName: string;
    numericCode: string;
    flags: Flags;
    currencies: Currency[];
    languages: Language[];
    translations: Translations;
    flag: string;
    regionalBlocs: RegionalBloc[];
    cioc: string;
    independent: boolean;
}
const onError = (e: { message: string }) => {
    container.innerHTML = '';
    error({
        text: `Sorry, there were some problems - ${e.message}.`,
        delay: 4000,
        width: '200px',
    });
    formReset();
};
const onWrongRequest = () => {
    container.innerHTML = '';
    error({
        text: `You made a wrong request.`,
        delay: 4000,
        width: '200px',
    });
    formReset();
};
const onTooManyCountriesGet = (count: number) => {
    container.innerHTML = '';
    error({
        text: `There are too many countries in the list (${count}). Please, make a more specific request`,
        delay: 1000,
        width: '200px',
    });
};

const selectCountriesName = (countries: Country[]) =>
    countries.map((c) => c.name);
const selectLanguagesName = (languages: Language[]) =>
    languages.map((l) => l.name);
const listMarkUp = (countries: Country[]) => {
    container.innerHTML = '';
    const countriesNames = selectCountriesName(countries);
    const markUp = countryListTemplate({ countries: countriesNames });
    container.insertAdjacentHTML('beforeend', markUp);
};
const cardMarkUp = (country: Country) => {
    container.innerHTML = '';
    const languages = selectLanguagesName(country.languages);
    const markUp = countryCardTemplate({
        name: country.name,
        capital: country.capital,
        population: country.population,
        languages,
        flag: country.flag,
    });
    container.insertAdjacentHTML('beforeend', markUp);
};
const onChange = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value.trim();
    value === ''
        ? onWrongRequest()
        : fetchCountries(value)
              .then((countries: Country[]) => {
                  countries.length > 10
                      ? onTooManyCountriesGet(countries.length)
                      : countries.length === 1
                      ? cardMarkUp(countries[0])
                      : listMarkUp(countries);
              })
              .catch(onError)
              .finally(formReset);
};
const formReset = () => (input.value = '');
const debounce = (fn: (e: InputEvent) => void, ms: number) => {
    let timeout: NodeJS.Timeout | null;
    return function () {
        const fnCall = () => {
            fn.apply(this, arguments);
        };
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
    };
};

const fetchCountries = (name: string) => {
    return fetch(`${BASE_URL}/v2/name/${name}
`).then((r) => {
        if (!r.ok) {
            throw new Error(r.statusText);
        }
        return r.json();
    });
};

input.addEventListener('input', debounce(onChange, 500));
