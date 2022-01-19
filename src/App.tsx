import { useObservableState } from "observable-hooks";
import React, { useMemo } from "react";
import { BehaviorSubject, combineLatestWith, map } from "rxjs";
import "./App.css";
import PokemonProvider, { usePokemon } from "./store";

const Deck = () => {
	const { deck$ } = usePokemon();
	const deck = useObservableState(deck$, []);

	return (
		<div style={{}}>
			<h4>Deck</h4>
			<div>
				{deck.map((p) => (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							flexWrap: "wrap",
							maxHeight: 400,
						}}
						key={p.id}
					>
						<img
							src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
							alt={p.name.english}
						/>
						<div>
							<div>{p.name.english}</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const Search = () => {
	// const [search, setSearch] = useState("");
	const search$ = useMemo(() => new BehaviorSubject(""), []);
	const { pokemon$, selected$ } = usePokemon();

	const [filteredPokemon] = useObservableState(
		() =>
			pokemon$.pipe(
				combineLatestWith(search$),
				map(([pokemon, search]) =>
					pokemon.filter((p) =>
						p.name.english.toLowerCase().includes(search.toLowerCase())
					)
				)
			),
		[]
	);

	return (
		<div>
			<input
				type="text"
				value={search$.value}
				onChange={(e) => search$.next(e.target.value)}
			/>
			{filteredPokemon.map((p) => (
				<div key={p.id}>
					<input
						type="checkbox"
						checked={p.selected}
						onChange={() => {
							if (selected$.value.includes(p.id)) {
								selected$.next(selected$.value.filter((id) => id !== p.id));
							} else {
								selected$.next([...selected$.value, p.id]);
							}
						}}
					/>
					<strong>{p.name.english}</strong> - {p.base.power}
				</div>
			))}
		</div>
	);
};

const App: React.FC = () => {
	return (
		<PokemonProvider>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
				}}
			>
				<Search />
				<Deck />
			</div>
		</PokemonProvider>
	);
};

export default App;
