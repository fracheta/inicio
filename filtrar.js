const usuarios = [  //lista(array)
    {nome: "carlos", idade: 32},
    {nome:"Ana", idade: 28},
    {nome:"João", idade: 40}
]

//encontrando um objeto - find == busca igual
const ana = usuarios.filter(usuario => usuario.nome === "Ana")
console.log(ana)

//filtrar objetos
const usuariosAcimaDe30 = usuarios.filter(usuario => usuario.idade > 30)
console.log(usuariosAcimaDe30)

//ordenando objetos por idade
const usuariosOrdenadosPor = usuarios.sort((a, b) => a.idade - b.idade)
console.log(usuariosOrdenadosPor)

//ordenando objetos por idade
const usuariosOrdenadosPorV = usuarios.sort((a, b) => b.idade - a.idade)
console.log(usuariosOrdenadosPor)
