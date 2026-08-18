# AuraLens Pro — Computational Color Science & In-Browser Pipeline

This document details the mathematical foundations and computational photography algorithms implemented in AuraLens Pro.

---

## 1. Parametric S-Curve Tone Mapping (Highlight Roll-Off)

Traditional digital editing applies linear contrast modifications, which frequently causes specular highlights to clip abruptly into flat pure white (`#FFFFFF`).

AuraLens Pro uses **Cubic Hermite Splines** to create soft, organic highlight compression:

$$\text{Curve}(t) = t^2 \cdot (3 - 2t) \quad \text{for } t \in [0, 1]$$

The roll-off strength dynamically blends the linear normalized luminance with the smooth curve:

$$R_{\text{out}} = \left( R_{\text{norm}} \cdot (1 - \alpha) + \text{Curve}(R_{\text{norm}}) \cdot \alpha \right) \times 255$$

Where $\alpha = \frac{\text{sCurveRollOff}}{100} \times 0.60$.

---

## 2. Photochemical Halation Simulation

Analog films (such as CineStill 800T and Kodak Vision3) feature an anti-halation layer that is removed during processing. As a result, strong light rays scatter off the film backing and expose the red-sensitive bottom layer from behind, creating an ethereal red/orange glow around high-contrast edges and specular points.

### Pipeline Implementation:
1. **Luminance Threshold Filtering**: Extract all pixels where luminance exceeds $L > 185$.
2. **Chromatic Red-Dominant Shift**:
   $$H_r = 255 \cdot f, \quad H_g = 60 \cdot f, \quad H_b = 20 \cdot f$$
   Where $f = \frac{L - 185}{255 - 185}$.
3. **Specular Diffusion Convolution**: Blurs the halation mask with a Gaussian radius relative to the canvas resolution.
4. **Screen Blend Mode Compositing**: Blends the diffused mask onto the graded canvas using `ctx.globalCompositeOperation = 'screen'`.

---

## 3. Luminance-Adaptive Film Grain

Silver-halide grains in physical film develop non-linearly across the exposure curve, clumping densely in **Zone V midtones** while diminishing in deep shadows and specular highlights.

### Algorithm:
For each pixel with luminance $L$:
$$\text{Weight}_{\text{midtone}} = \max\left(0.2, 1 - \frac{|L - 128|}{128}\right)$$
$$\text{Noise} = (\text{rand}() - 0.5) \times \text{GrainAmount} \times \text{Weight}_{\text{midtone}}$$

---

## 4. Multi-Pass Super-Resolution & Laplacian Edge Matrix

The in-browser super-resolution upscaler executes in two mathematical phases:

### Phase A: Progressive Sub-Pixel Interpolation
Instead of single-step bilinear stretching, the image is scaled in progressive stepped stages:
$$\text{Width}_{\text{step}} = \text{Width}_{\text{orig}} \times 2^k \quad (k \in \{1, 2\})$$

### Phase B: 4-Neighborhood Laplacian Edge Matrix
For each channel $C \in \{R, G, B\}$ at coordinate $(x, y)$:
$$\nabla^2 C(x, y) = 4 \cdot C(x, y) - C(x, y-1) - C(x, y+1) - C(x-1, y) - C(x+1, y)$$
$$C_{\text{enhanced}}(x, y) = \text{clamp}\left(0, 255, C(x, y) + \nabla^2 C(x, y) \cdot \beta\right)$$

Where $\beta = \frac{\text{sharpness}}{100} \times 0.45$.

---

## 5. Computational Optical Bokeh (Circle of Confusion)

The optical depth engine creates medium-format background separation by calculating a radial depth gradient centered on the subject focal anchor:

$$\text{Mask}(x, y) = \text{smoothstep}\left(R_{\text{inner}}, R_{\text{outer}}, \sqrt{(x - x_0)^2 + (y - y_0)^2}\right)$$

The background layer is convolved with a Gaussian blur kernel simulating a shallow $f/1.4$ prime lens, then composited beneath the sharp subject plane.

---

## 6. Industry-Standard .CUBE 3D LUT & .XMP Presets

* **`.CUBE` (33x33x33 3D LUT)**: Maps the 3D RGB cube with $35,937$ sampling points for DaVinci Resolve, Adobe Premiere Pro, Final Cut Pro, and Photoshop.
* **`.XMP` (Adobe Camera Raw Preset)**: Formats an industry-standard XML sidecar file containing all numerical curves, Kelvin white balance, split toning, and clarity parameters.
