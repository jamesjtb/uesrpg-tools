import { parse } from 'yaml';
import { readFile } from 'fs/promises';
import { table } from 'console';

interface RollTable {
    id: string;
    name: string;
    nextTable?: string;
    entries: RollTableResult[];
    outputEmptyValue?: boolean;
}

export interface RollTableResult {
    value: string;
    el?: number;
    nextTable?: string;
    weight?: number;
    outputEmptyValue?: boolean;
}

export default class GeneratorService {
    async generateEquipment(): Promise<RollTableResult> {
        console.log('=== GENERATING EQUIPMENT ===');
        const rollTableSetName = 'equipment';
        let cumulativeResult: RollTableResult = { value: '', el: 0, nextTable: 'categories' };
        while (cumulativeResult.nextTable) {
            const result = await this.rollOnTable(rollTableSetName, cumulativeResult.nextTable);

            let cumulativeEl = cumulativeResult.el || 0;
            if (result.el) cumulativeEl += result.el;
            const cumulativeValue = cumulativeResult.value ? `${cumulativeResult.value} ${result.value}` : result.value;
            cumulativeResult = {
                value: cumulativeValue,
                el: cumulativeEl,
                nextTable: result.nextTable,
            };
        }
        delete cumulativeResult.nextTable;
        return cumulativeResult;
    }

    private async rollOnTable(
        rollTableSetName: string,
        rollTableId: string
    ): Promise<RollTableResult> {
        const rollTableSet = await this.getRollTableSet(rollTableSetName);
        const rollTable = rollTableSet.find(table => table.id === rollTableId);
        if (!rollTable) {
            throw new Error(
                `Roll table with ID ${rollTableId} not found in set ${rollTableSetName}`
            );
        }
        const rollTableWithWeights = this.addWeights(rollTable);
        const rollTableResult = this.makeRoll(rollTableWithWeights);
        return rollTableResult;
    }

    private async getRollTableSet(rollTableSet: string): Promise<RollTable[]> {
        const filePath = __dirname + '../../../data/3e/' + rollTableSet + '.yml';
        const fileContent = await readFile(filePath, 'utf8');
        return parse(fileContent) as RollTable[];
    }

    addWeights(tableData: RollTable): RollTable {
        tableData.entries = tableData.entries.flatMap((entry) => {
            const weight = entry.weight ?? 1;
            const weightedEntries = [];
            for (let i = 0; i < weight; i ++) {
                weightedEntries.push({
                    ...entry,
                });
                delete weightedEntries[i].weight;
            }
            return weightedEntries;
        });
        return tableData;
    }

    private makeRoll(tableData: RollTable): RollTableResult {
        console.log(`Rolling on table: ${tableData.name}`);
        const totalEntries = tableData.entries.length;
        const randomIndex = Math.floor(Math.random() * totalEntries);
        const result = tableData.entries[randomIndex];
        
        console.log(`- Result: ${result.value}`);
        console.log('---');
        return {
            ...result,
            nextTable: result.nextTable ?? tableData.nextTable,
            value: result.outputEmptyValue || tableData.outputEmptyValue ? '' : result.value,
        };
    }
}
