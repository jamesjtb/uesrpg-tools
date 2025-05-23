import RollTableUtil from '../../util/RollTableUtil';

export interface EquipmentRollTable {
    id: string;
    name: string;
    nextTable?: string;
    entries: EquipmentRollTableResult[];
    outputEmptyValue?: boolean;
}

export interface EquipmentRollTableResult {
    value: string;
    el?: number;
    nextTable?: string;
    weight?: number;
    outputEmptyValue?: boolean;
}

export default class EquipmentGenerationService {
    async generateEquipment(): Promise<EquipmentRollTableResult> {
        console.log('\n=== GENERATING EQUIPMENT ===');
        const rollTableSetName = 'equipment';
        let cumulativeResult: EquipmentRollTableResult = { value: '', el: 0, nextTable: 'categories' };
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

    async rollOnTable(
        rollTableSetName: string,
        rollTableId: string
    ): Promise<EquipmentRollTableResult> {
        const rollTableSet = await RollTableUtil.readData<EquipmentRollTable[]>(rollTableSetName);
        const rollTable = rollTableSet.find(table => table.id === rollTableId);
        if (!rollTable) {
            throw new Error(
                `Roll table with ID ${rollTableId} not found in set ${rollTableSetName}`
            );
        }
        const rollTableWithWeights = {
            ...rollTable,
            entries: RollTableUtil.addWeights(rollTable.entries),
        }
        const rollTableResult = this.makeRoll(rollTableWithWeights);
        return rollTableResult;
    }

    private makeRoll(tableData: EquipmentRollTable): EquipmentRollTableResult {
        console.log(`\nRolling on table: ${tableData.name}`);
        const totalEntries = tableData.entries.length;
        const randomIndex = Math.floor(Math.random() * totalEntries);
        const result = tableData.entries[randomIndex];
        
        console.log(`- Result: ${result.value}\n`);
        return {
            ...result,
            nextTable: result.nextTable ?? tableData.nextTable,
            value: result.outputEmptyValue || tableData.outputEmptyValue ? '' : result.value,
        };
    }
}
