import { readFile } from 'fs/promises';
import { parse } from 'yaml';

type WeightedObject = { weight?: number };

export default class RollTableUtil {
    static addWeights<T>(weightedArray: (WeightedObject & T)[]): T[] {
        return weightedArray.flatMap(entry => {
            const weight = entry.weight ?? 1;
            const weightingResult = [];
            for (let i = 0; i < weight; i++) {
                const entryCopy = { ...entry };
                delete entryCopy.weight;
                weightingResult.push(entryCopy);
            }
            return weightingResult;
        });
    }

    static async readData<T>(rollTableSetName: string): Promise<T> {
        const filePath = `${__dirname}/../data/3e/${rollTableSetName}.yml`;
        const fileContent = await readFile(filePath, 'utf8');
        return parse(fileContent);
    }
}
