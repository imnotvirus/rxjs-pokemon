import { createContext, useContext } from "react";
import { BehaviorSubject, combineLatestWith, map } from "rxjs";

export interface Pokemon {
	id: number;
	name: Name;
	type: string[];
	base: Base;
	selected?: boolean;
}

interface Base {
	HP: number;
	Attack: number;
	Defense: number;
	"Sp. Attack": number;
	"Sp. Defense": number;
	Speed: number;
	power?: number;
}

interface Name {
	english: string;
	japanese: string;
	chinese: string;
	french: string;
}

const rawPokemon$ = new BehaviorSubject<Pokemon[]>([]);

const pokemonWithPower$ = rawPokemon$.pipe(
	map((pokemon) =>
		pokemon.map((p) => ({
			...p,
			base: {
				...p.base,
				power:
					p.base.HP +
					p.base.Attack +
					p.base.Defense +
					p.base["Sp. Attack"] +
					p.base["Sp. Defense"] +
					p.base.Speed,
			},
		}))
	)
);

const selected$ = new BehaviorSubject<number[]>([]);

const pokemon$ = pokemonWithPower$.pipe(
	combineLatestWith(selected$),
	map(([pokemon, selected]) =>
		pokemon.map((p) => ({
			...p,
			selected: selected.includes(p.id),
		}))
	)
);

const deck$ = pokemon$.pipe(
	map((pokemon) => pokemon.filter((p) => p.selected))
);

fetch("/pokemon.json")
	.then((res) => res.json())
	.then((data) => rawPokemon$.next(data));

const PokemonContext = createContext({
	pokemon$,
	selected$,
	deck$,
});

export const usePokemon = () => useContext(PokemonContext);

const PokemonProvider: React.FC = ({ children }) => {
	return (
		<PokemonContext.Provider value={{ pokemon$, selected$, deck$ }}>
			{children}
		</PokemonContext.Provider>
	);
};

export default PokemonProvider;
