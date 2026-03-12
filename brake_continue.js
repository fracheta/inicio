let carros_estacionados = 0;
const limitemaximo = 4;

console.log("___ iniciar verificação ___");

for (let vaga = 1; vaga <= 10; vaga++) {
    if (vaga === 4 || vaga === 7 || vaga === 3) {
        console.log(`Vaga ${vaga}: [INTERROMPIDO] - pulando`);
        continue; 
    }
    carros_estacionados++;
    console.log(`Vaga ${vaga}: [LIVRE] -> carro estacionado! (Total: ${carros_estacionados})`);
    if (carros_estacionados === limitemaximo) {
        console.log("--- Limite atingido! Fechar portão ---");
        break; 
    }
}
console.log("Relatório final: operação de entrada encerrada");