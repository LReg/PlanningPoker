import {ExportEstimatePlayer, ExportPlayer, Player} from "./PlayerModel";

export enum EstimationOption {
    Fibonacci = 'Fibonacci',
    PowersOfTwo = 'PowersOfTwo',
    TShirtSizes = 'TShirtSizes',
    PersonDays = 'PersonDays',
    Custom = 'Custom',
}

export const FibonacciEstimationValues = ['🤷‍♂️', '☕', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '144'];
export const PowersOfTwoEstimationValues = ['🤷‍♂️', '☕', '1', '2', '4', '8', '16', '32', '64', '128', '256', '512', '1024'];
export const TShirtSizesEstimationValues = ['🤷‍♂️', '☕', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const PersonDaysEstimationValues = ['🤷‍♂️', '☕', '0.5', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];

export function getEstimationValues(options: EstimationOption): string[] {
    switch (options) {
        case EstimationOption.Fibonacci:
            return FibonacciEstimationValues;
        case EstimationOption.PowersOfTwo:
            return PowersOfTwoEstimationValues;
        case EstimationOption.TShirtSizes:
            return TShirtSizesEstimationValues;
        case EstimationOption.PersonDays:
            return PersonDaysEstimationValues;
        case EstimationOption.Custom:
            return [];
    }
}

export function parseEstimationType(type: string): EstimationOption | undefined {
    switch (type) {
        case 'Fibonacci':
            return EstimationOption.Fibonacci;
        case 'PowersOfTwo':
            return EstimationOption.PowersOfTwo;
        case 'TShirtSizes':
            return EstimationOption.TShirtSizes
        case 'PersonDays':
            return EstimationOption.PersonDays;
        case 'Custom':
            return EstimationOption.Custom;
    }
    return undefined;
}

export interface Session {
    token: string;
    name: string;
    players: Player[];
    // open = true -> everyone can see the estimates
    open: boolean;
    estimationOptions: EstimationOption;
    estimationValues: string[];
}

export interface NewSessionDto {
    name: string;
    leaderName: string;
}

export interface ExportSession {
    token: string;
    name: string;
    players: ExportPlayer[];
    open: boolean;
}

export interface ExportEstimateSession {
    token: string;
    name: string;
    players: ExportEstimatePlayer[];
    open: boolean;
    estimationOptions: EstimationOption;
    estimationValues: string[];
}