const usuarios = [
    {nome: "carlos", idade: 32},
    {nome:"Ana", idade: 28},
    {nome:"João", idade: 40}
]

const ana = usuarios.filter(usuario => usuario.nome === "Ana")
console.log(ana)

const usuariosAcimaDe30 = usuarios.filter(usuario => usuario.idade > 30)
console.log(usuariosAcimaDe30)

const usuariosOrdenadosPorIdade = usuarios.sort((a, b) => a.idade - b.idade)
console.log(usuariosOrdenadosPorIdade)