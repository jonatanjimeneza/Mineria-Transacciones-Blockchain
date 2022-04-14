//Utilizamos la libreria crypto-js para realizar el calculo del HASH de los parametros que indiquemos en el constructor del block.
const SHA256 = require('crypto-js/sha256')

//**Que son las transacciones?
//Es un envio o transferencia de un valor entre dos partes.
//Añadimos una nueva clase para añadir transacciones en lugar del data.
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

//Primero de todo creamos nuestro bloque
class Block{
    //Hacemos un constructor con las variables que comportan el bloque.
    //**Cambiamos data por transactions */
    constructor(timestamp, transactions, previousHash=''){
        //Tiempo de la transacción
        this.timestamp = timestamp;
        //Datos del bloque como pueden ser dirección de las wallets, cantidad de crypto...
        this.transactions = transactions;
        //El Hash del anterior bloque.
        this.previousHash = previousHash;
        //Hash del actual bloque
        this.hash = this.calculateHash();
        //Añadimos Nonce a nuestro constructor **
        this.nonce = 0;
    }
    //Función para calcular el Hash del bloque
    //Un hash es el resultado de una función hash, la cual es una operación criptográfica que genera identificadores únicos 
    //e irrepetibles a partir de una información dada. Los hashes son una pieza clave en la tecnología blockchain 
    //y tiene una amplia utilidad.
    //Añadimos el nonce al calculo del hash
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions)+ this.nonce).toString();
    }

    //Que es proof of work?
    //El protocolo de Prueba de Trabajo o Proof of Work, es el más conocido 
    //y antiguo protocolo de consenso que consiste en que las partes de una red realicen con éxito un trabajo computacionalmente costoso para acceder a los recursos de dicha red. 
    //Como es la minera....

    //Que es difficulty?
    //La configuración de la dificultad de minería depende de los protocolos de programación y operación de cada cadena de bloques y criptomoneda. 
    //Como ya hemos explicado, la dificultad de minado en Bitcoin debería permitir a los mineros resolver y generar un nuevo bloque aproximadamente cada 10 minutos. 
    //Y cuando no se cumple esta condición, se ajusta el grado de dificultad.

    //Que es nonce?
    //El 'número que solo se puede usar una vez', (número que solo se puede usar una vez) también conocido como nonce , es un número arbitrario que se usa en criptografía 
    //dentro de los llamados protocolos de autenticación.
    //En una red blockchain basada en Prueba de trabajo(proof of work) , el nonce funciona en combinación con el hash como elemento de control para evitar 
    //la manipulación de la información del bloque .
    //Este número aleatorio garantiza que los hashes antiguos no se puedan reutilizar en lo que se denominan ataques de repetición.

    //Implementación proof of work con la función de minado del bloque.
    mineBlock(difficulty){
        //Mientas no se cumpla la dificultad (en función de la dificultad indicada) estará realizando el calculo del hash.
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: "+ this.hash);
    }
}

//Creamos nuestra blockchain
class Blockchain{

    constructor(){
        this.chain = [this.createGenesisBlock()];
        //***Añadimos la variable de dificultad de minado del bloque en nuestro constructor.
        this.difficulty = 4;
        //Añadimos a nuestro constructor un array de transacciones pendientes.
        this.pendingTransactions = [];
        //Tambien añadimos un recompensa por el minado del bloque.
        this.miningReward = 100;
    }

    //Función para crear nuestro Bloque Genesis. Se llama bloque genesis al primer bloque de cada blockchain.
    createGenesisBlock(){
        return new Block(0, "01/01/2022","Genesis Block","0");
    }

    //Función para obtener el anterior bloque
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    //Quitamos el AddBlock y lo cambiamos por la funcion de minado de transacciones pendientes, que la llamamos...miningPendingTransactions.
    minedPendingTransactions(miningRewardAddress){
        //Definimos la creacion de un nuevo bloque.
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        //Le pasamos la dificultad al minado del bloque.
        block.mineBlock(this.difficulty);
        
        //Añadimos el bloque a la cadena
        console.log('Bloque se ha minado correctamente');
        this.chain.push(block);

        //Cuando se ha minado la transaccion se crea otra transaccion para enviar el reward(premio) a la wallet del minero.
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    //Función para crear una transacción.
    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    //Función para obtener el balance de una dirección.
    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance-= trans.amount;
                }
                if(trans.toAddress === address){
                    balance+=trans.amount;
                }
            }
        }
        return balance;
    }

    //Función para comprobar si nuestra blockchain es valida.
    isChainValid(){
        for(let i = 1; i< this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

//Definimos el nombre de nuestra Blockchain
let JJACoin = new Blockchain();

//Creamos nuevas transacciones de envio de dinero a diferentes wallets para luego comenzar el minado de los bloques de cada transaccion.
JJACoin.createTransaction(new Transaction('Address 1', 'Address 2', 50));
JJACoin.createTransaction(new Transaction('Address 2', 'Address 3', 250));

//Comenzar el minado.
console.log('\n Comenzando el minado....')
JJACoin.minedPendingTransactions('Jonatan-Address');
//Obtener el balance del minero.
console.log('\nEl Balance de Jonatan es', JJACoin.getBalanceOfAddress('Jonatan-Address'));

//Minamos otro bloque para obtener la recompensa del minado que hemos establecido a partir del segundo bloque.
console.log('\n Comenzando el minado otra vez....')
JJACoin.minedPendingTransactions('Jonatan-Address');

//Obtener el balance final.
console.log('\nEl Balance de Jonatan es', JJACoin.getBalanceOfAddress('Jonatan-Address'));
