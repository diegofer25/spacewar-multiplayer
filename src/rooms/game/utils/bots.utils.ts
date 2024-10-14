// list of unique names
const names = [
    'Alexandre',
    'Amanda',
    'Ana',
    'André',
    'Beatriz',
    'Bianca',
    'Bruna',
    'Bruno',
    'Bruno',
    'Camila',
    'Carlos',
    'Carolina',
    'Cláudia',
    'Daniel',
    'Diego',
    'Eduardo',
    'Fábio',
    'Felipe',
    'Fernanda',
    'Fernando',
    'Gabriel',
    'Gabriela',
    'Guilherme',
    'Isabela',
    'Jéssica',
    'João',
    'Juliana',
    'Larissa',
    'Larissa',
    'Laura',
    'Leonardo',
    'Letícia',
    'Lucas',
    'Luiza',
    'Marcelo',
    'Maria',
    'Mariana',
    'Matheus',
    'Natália',
    'Patrícia',
    'Pedro',
    'Rafael',
    'Renata',
    'Renato',
    'Ricardo',
    'Rodrigo',
    'Sofia',
    'Thiago',
    'Vanessa',
    'Vitor',
];

const trashTalkMessages = [
    "You call that flying? I've seen asteroids with better moves!",
    'Prepare to be space dust!',
    'Is that your best shot? Pathetic!',
    "I'll send your ship to the scrapyard!",
    "You should've stayed on your home planet!",
    'You’re slower than a space snail!',
    "I'll finish you faster than a supernova!",
    'Say goodbye to your shields, rookie!',
    "Hope you brought a spare ship... you'll need it!",
    'You’ll need more than luck to beat me!',
    'Is that a laser or a flashlight? Weak!',
    "Your ship's so slow, I could take a nap!",
    'Running away? Figures!',
    'Nice aim… if you were trying to hit empty space!',
    'You fly like a meteor out of control!',
    'Hope you’ve got your space insurance!',
    "You're about to learn what real piloting looks like!",
    'I’d give you a head start, but it wouldn’t help!',
    'Keep shooting, maybe you’ll hit something someday!',
    'Game over for you, space cadet!',
];

export function getRandomBotName(_names: string[]) {
    const name = names[Math.floor(Math.random() * names.length)];

    const nameCount = _names.filter(n => n === name).length;

    const [firstLetter, ...rest] = name;
    return `${firstLetter.toUpperCase() + rest.join('')}-Bot${nameCount ? `-${nameCount}` : ''}`;
}

export function getRandomTrashTalkMessage() {
    return trashTalkMessages[Math.floor(Math.random() * trashTalkMessages.length)];
}
