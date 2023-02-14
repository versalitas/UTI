import {Howl} from 'howler';
// Audio library documentation:
// https://howlerjs.com
// https://goldfirestudios.com/blog/104/howler.js-Modern-Web-Audio-Javascript-Library

export const loadSongLastScene = (callback) => {
  var completeAudio = "DEBUSSY_MIDI027.mp3";

  var soundFinal = new Howl({
    src: [completeAudio],
    onload: function() {
      callback();
      setTimeout(function(){
          soundFinal.play();
      },180); // delay screen
    },
    onend: function() {
     this.unload();
    }
  })

}

export const loadAndPlaySoundMessage = (soundId) => {
  console.log('soundId:',soundId)

  // Sound director
  if(soundId<=0){soundId=0;}

  var audioFile = "DEBUSSY_AUDIOS/"+addZeros(soundId)+'.wav';
  const audio = new Audio(audioFile)
  audio.addEventListener("canplaythrough", () => {
    audio.play().catch(e => {
        window.addEventListener('click', () => {
          audio.play()
        }, { once: true })
    })
  });
}


function addZeros(str){
  var number = str+'';
  if(number.length===1) number = "00"+number;
  if(number.length===2) number = "0"+number;
  return number;
}
