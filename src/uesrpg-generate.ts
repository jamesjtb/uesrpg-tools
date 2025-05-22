import { program } from 'commander';
import RollTableService, { RollTableResult } from './services/3e/RollTableService';

const rollTableService = new RollTableService();

const generateTypeMap: Record<string, () => Promise<RollTableResult>> = {
    equipment: rollTableService.generateEquipment.bind(rollTableService),
};

const availableTypes = Object.keys(generateTypeMap);

const availableTypesText = availableTypes.map(type => `- ${type}`).join('\n');

program
    .command('3e')
    .argument('<type>', `What to generate: ${availableTypesText}`)
    .action(async type => {
        if (availableTypes.includes(type)) {
            const generateFunction = generateTypeMap[type];
            const result = await generateFunction();
            console.log(`\n===FINAL RESULT===`);
            console.log(`Item: ${result.value}`);
            console.log(`EL: ${result.el}`);
        } else {
            console.error(`Unknown type: ${type}`);
            console.log(`Available types:\n${availableTypesText}`);
        }
    });

program.parse(process.argv);
