# qrlogo

Create QR-Code with logo and validaton.

qrlogo is an all in one function, to generate a QR-Code,
scale it with an multiplier, insert a logo, check if it's
still valid and if not, resize the logo down until it
becomes valid.
<!-- 
## Installation
To install qrlogo and all of its dependencies run:
```
npm install --save qrlogo
``` -->
## Usage:
Basic usage to generate QR-Codes:
```
const qrlogo = require('qrlogo');
const qrcode = await qrlogo('https://google.com');
```

All parameters except data are optional.

Logos can be added via passing second parameter
as string or buffer.
```
const qrcode = await qrlogo('https://google.com', 'logo.png');
```

Third parameter scales the QR-Code up. This can be used,
to get more space for a smooth logo inside the QR-Code.

With logoScale parameter you may define the starting
coefficient of the logo size. This defaults to 0.4 (40%).
Coefficients bigger than 0.5 are not recommended.

However if the coefficient is to big and the QR-Code
renders not readable, qrlogo will scale down the
coefficient with steps of 0.05 until it can be read.
If you would like to turn off autoscale, you can pass
`false` as fifth parameter.

The QR-Code is then returned as buffer.

## License
MIT License. Copyright (c) 2021 Daniel Elstner