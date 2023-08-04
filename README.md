👋 | RF Exposure Calculator
----------------------

```js
import { RFExposureCalculator } from 'rf-exposure-calculator';

const calculator = new RFExposureCalculator();

const results = calculator.calculateRFExposure(
    10,        // Power in Watts
    0.4,       // [0-1]: Mode Duty Cycle
    {          // TX Duty Cycle
        tx: 2, // Minutes spent transmitting
        rx: 3  // Minutes spent listening
    },
    1.3,       // Antenna gain in dBi
    7.200,     // Operating frequency in MHz
    true,      // `true` for a controlled environment, `false` for uncontrolled
    true       // Whether or not to include the effects of ground reflection
);
```

```json
{
    "max_allowed_power_density": 17.3611,
    "min_safe_distance_in_feet": 0.1846
}
```
