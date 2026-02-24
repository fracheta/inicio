let aluno="Robson";
let n1=100;
let n2=90;
let n3=10;
let n4=99;
let media=0;
let result="";
media=(n1+n2+n3+n4)/4;
if(media>=70){
    result="Aprovado";
}
else if(media>=50){
    result="Recuperacao";
}
else{
    result="Reprovado";
}
console.log("A media do aluno",aluno,"é:",media);
console.log("O aluno",aluno,"foi",result);