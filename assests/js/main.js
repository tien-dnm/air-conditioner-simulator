/**
  * VARIABLE
  */
var intervalID = null;
var intervalLoopLight = null;
let ShowLedLightWaitState = false;
const swingButton = document.getElementById("btn-toggle-swing");
const powerButton = document.getElementById("btn-toggle-power");
const swingElement = document.getElementById("swing");
const temperatureElement = document.getElementById("temperature");
const decreaseTemperatureButton = document.getElementById("btn-decrease-temp");
const increaseTemperatureButton = document.getElementById("btn-increase-temp");
const decreaseFanButton = document.getElementById("btn-decrease-fan");
const increaseFanButton = document.getElementById("btn-increase-fan");
const AudioElement = new Audio('./assests/audio/AirConditionerRunningSound.mp3');
const lightOverlay = document.getElementById("light-overlay");
let clickCountDown = 10;
/**
 * FUNCTION
 */
const intervalManager = (flag, animate, time) => {
    if (flag)
        intervalID = setInterval(animate, time);
    else
        clearInterval(intervalID);
}
/**
 * CLASS
 */

class AirConditioner {
    _swingDegree = 0
    _isSwing = true
    _isPowerOn = false
    _isSwingBack = false
    _maxTemperature = 30
    _minTemperature = 16
    _currentTemperature = 25
    _currentFanLevel = 1;
    _maxFanLevel = 5;
    _minFanLevel = 1;
    constructor() {
        this.#setTemp();
        lightOverlay.style.display = "none";
        const localtemp = localStorage.getItem("temp");
        const localfanlevel = localStorage.getItem("fan");
        if (!localtemp) {
            this._currentTemperature = 25
        } else {
            this._currentTemperature = parseInt(localtemp)
        }
        if (!localfanlevel) {
            this._currentFanLevel = 4;
        } else {
            this._currentFanLevel = parseInt(localfanlevel)
        }
    }
    #showLight() {
        clearInterval(intervalLoopLight);
        clickCountDown = 10
        lightOverlay.style.display = "block";
        intervalLoopLight = setInterval(() => {
            clickCountDown--;
            if (clickCountDown == 0) {
                lightOverlay.style.display = "none";
                clearInterval(intervalLoopLight);
            }
        }, 300);
    }
    #setLocalTemperature() {
        localStorage.setItem("temp", this._currentTemperature);
    }
    #setLocalFanLevel() {
        localStorage.setItem("fan", this._currentFanLevel);
    }
    #playAirConditionerSound() {
        AudioElement.play();
    }
    #stopAirConditionerSound() {
        AudioElement.pause();
        AudioElement.currentTime = 0;
    }
    #playRemoteBeepSound() {
        const BeepAudio = new Audio('./assests/audio/RemoteBeepSound.mp3');
        BeepAudio.play();
    }
    #swing() {
        swingElement.style.transform = `rotateX(${this._swingDegree}deg)`;
    }
    #decreaseSwingDegree() {
        this._swingDegree -= 1;
        this.#swing();
    }
    #increaseSwingDegree() {
        this._swingDegree += 1;
        this.#swing();
    }
    #setTemp() {
        if (this._isPowerOn) {
            temperatureElement.textContent = this._currentTemperature
        } else {
            temperatureElement.textContent = ""
        }
    }
    #setFan() {
        if (this._isPowerOn) {
            console.log(this._currentFanLevel)
        }
    }
    togglePower() {
        this.#playRemoteBeepSound();
        this.#showLight();
        this._isPowerOn = !this._isPowerOn;
        this.#triggerRun();
    }
    toggleSwing() {

        if (this._isPowerOn) {
            this.#playRemoteBeepSound();
            this.#showLight();
            this._isSwing = !this._isSwing;
        }
    }
    increaseTemperature() {
        if (this._isPowerOn) {
            this.#playRemoteBeepSound();
            this.#showLight();
            this.#setLocalTemperature()
            if (this._currentTemperature < this._maxTemperature) {
                this._currentTemperature += 1;
                this.#setTemp()
            }
        }
    }
    decreaseTemperature() {
        if (this._isPowerOn) {
            this.#playRemoteBeepSound();
            this.#showLight();
            this.#setLocalTemperature()
            if (this._currentTemperature > this._minTemperature) {
                this._currentTemperature -= 1;
                this.#setTemp()
            }
        }
    }
    increaseFanLevel() {
        if (this._isPowerOn) {
            this.#playRemoteBeepSound();
            this.#showLight();
            this.#setLocalFanLevel()
            if (this._currentFanLevel < this._maxFanLevel) {
                this._currentFanLevel += 1;
                this.#setFan()
            }
        }
    }
    decreaseFanLevel() {
        if (this._isPowerOn) {
            this.#playRemoteBeepSound();
            this.#showLight();
            this.#setLocalFanLevel()
            if (this._currentFanLevel > this._minFanLevel) {
                this._currentFanLevel -= 1;
                this.#setFan()
            }
        }
    }
    #triggerRun() {
        this.#setTemp()
        intervalManager(false);
        //================================
        if (this._isPowerOn) {
            this.#powerOn();
        }
        //================================
        if (!this._isPowerOn) {
            this.#powerOff();
        }
    }
    #powerOn() {
        this.#playAirConditionerSound()
        this._isSwingBack = false;
        intervalManager(true,
            () => {
                if (this._isSwing) {
                    if (this._isSwingBack) {
                        this.#decreaseSwingDegree();
                        if (this._swingDegree == 0) {
                            this._isSwingBack = false
                        }
                    }
                    if (!this._isSwingBack) {
                        this.#increaseSwingDegree();
                        if (this._swingDegree == 180) {
                            this._isSwingBack = true;
                        }
                    }
                }
            },
            7200 / 360
        )
    }
    #powerOff() {
        this.#stopAirConditionerSound()
        intervalManager(true,
            () => {
                if (this._swingDegree == 0) {
                    intervalManager(false);
                } else {
                    this.#decreaseSwingDegree()
                }
            },
            7200 / 360
        )
    }
}
/**
 * ================================================================================================================
 */
const myAirConditioner = new AirConditioner();
powerButton.addEventListener("click", () => {
    myAirConditioner.togglePower();
});
AudioElement.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
}, false);
swingButton.addEventListener("click", () => {
    myAirConditioner.toggleSwing();
});
decreaseTemperatureButton.addEventListener("click", () => {
    myAirConditioner.decreaseTemperature();
});
increaseTemperatureButton.addEventListener("click", () => {
    myAirConditioner.increaseTemperature();
});
decreaseFanButton.addEventListener("click", () => {
    myAirConditioner.decreaseFanLevel();
});
increaseFanButton.addEventListener("click", () => {
    myAirConditioner.increaseFanLevel();
});

