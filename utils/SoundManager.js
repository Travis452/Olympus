import {Audio} from 'expo-av';

let sound = null;
let loopStart = 11450;
let loopEnd = 16994;

export const playLoopingMusic = async () => {
    if (sound) return;

    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        const {sound: newSound } = await Audio.Sound.createAsync(
            require('../assets/music/k_d - s e l e c t - m e n u [NIGHTMODE].mp3'),
            { shouldPlay: true, isLooping: true, volume:1.0}
        );

        sound = newSound;

        sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isPlaying && status.positionMillis >= loopEnd) {
                await sound.setPositionAsync(loopStart);
            }
        });
        await sound.playAsync();
    } catch (error) {
        console.error('Error loading looping sound:', error);
    }
};

export const stopMusic = async () => {
    if (sound) {
        try {
        await sound.stopAsync();
        await sound.unloadAsync();
        sound = null;
    } catch (error) {
        console.error('Failed to stop/unload sound:', error);
    }
}
};