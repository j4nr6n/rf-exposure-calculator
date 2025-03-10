export default class {
    calculateRFExposure(
        powerInWatts,
        modeDutyCycle,
        txDutyCycle,
        antennaGainInDbi,
        operatingFrequencyInMhz,
        controlledEnvironment = false,
        includeGroundReflectionEffects = true,
    ) {
        const exposureLimits = this.getExposureLimits(operatingFrequencyInMhz);
        const maxDensity = controlledEnvironment ? exposureLimits.controlled : exposureLimits.uncontrolled;
        const Gf = includeGroundReflectionEffects ? 0.64 : 0.25;
        const Pwr = 1000.0 * powerInWatts * modeDutyCycle * this.timeAveragePercent(txDutyCycle.tx, txDutyCycle.rx, controlledEnvironment ? 6 : 30);
        const Eirp = Pwr * Math.pow(10, antennaGainInDbi / 10); // EIRP in milliwatts, adjusting for antenna gain
        const minDistance = Math.sqrt((Gf * Eirp) / (maxDensity * Math.PI)) / 30.48;

        return {
            'max_allowed_power_density': maxDensity.toFixed(4),
            'min_safe_distance_in_feet': minDistance.toFixed(4)
        };
    }

    getExposureLimits(frequencyInMhz) {
        if (frequencyInMhz < 0.3) {
            throw new Error('The FCC does not have exposure limits below 0.3 MHz')
        }

        if (frequencyInMhz < 1.34) {
            return {
                controlled: 100.0,
                uncontrolled: 100.0
            };
        }

        if (frequencyInMhz < 3) {
            return {
                controlled: 100.0,
                uncontrolled: 180.0 / (Math.pow(frequencyInMhz, 2))
            };
        }

        if (frequencyInMhz < 30) {
            return {
                controlled: 900.0 / (Math.pow(frequencyInMhz, 2)),
                uncontrolled: 180.0 / (Math.pow(frequencyInMhz, 2))
            };
        }

        if (frequencyInMhz < 300) {
            return {
                controlled: 1.0,
                uncontrolled: 0.2
            };
        }

        if (frequencyInMhz < 1500) {
            return {
                controlled: frequencyInMhz / 300,
                uncontrolled: frequencyInMhz / 1500
            };
        }

        if (frequencyInMhz <= 100000) {
            return {
                controlled: 5.0,
                uncontrolled: 1.0
            };
        }

        throw new Error('The FCC does not have exposure limits above 100 GHz');
    }

    /**
     * @param txMinutes Amount of time, in minutes, spent transmitting
     * @param rxMinutes Amount of time, in minutes, spent receiving
     * @param interval 6 for a controlled environment, 30 for an uncontrolled environment
     */
    timeAveragePercent(txMinutes, rxMinutes, interval) {
        const cycle = txMinutes + rxMinutes; // How long a complete cycle lasts
        const remainder = interval % cycle; // Remainder of time in `interval` after maximum number of complete cycles
        const txCompleteCycles = Math.floor(interval / cycle) * txMinutes; // Total transmit time, in minutes, for complete cycles

        if (txMinutes >= interval) {
            // `txMinutes` is longer than the `interval`. Transmitting 100% of the time.
            return 1.0;
        }

        if (cycle >= interval) {
            // One full cycle is longer than the interval.
            return (txMinutes / interval);
        }

        if (txMinutes > remainder) {
            // Time from complete cycles plus the remainder of the time
            return ((txCompleteCycles + remainder) / interval);
        }

        // Time from complete cycles plus tx portion of a single cycle.
        return ((txCompleteCycles + txMinutes) / interval);
    }
}
