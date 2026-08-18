# AuraLens Pro — Computational Color Science & In-Browser Pipeline

This document explains the mathematical foundations and photochemical algorithms implemented in the AuraLens Pro In-Browser Darkroom Studio.

---

## 1. Parametric S-Curve Tone Mapping (Highlight Roll-Off)

Traditional digital photo editing applies linear contrast modifications, which frequently causes specular highlights (e.g. skies, direct sun reflections, snow) to clip abruptly into flat pure white (`#FFFFFF`).

AuraLens Pro uses **Cubic Hermite Splines** to create soft, organic highlight compression:

$$\text{Curve}(t) = t^2 \cdot (3 - 2t) \quad \text{for } t \in [0, 1]$$

The roll-off strength dynamically blends the linear normalized luminance with the smooth curve:

$$R_{\text{out}} = \left( R_{\text{norm}} \cdot (1 - \alpha) + \text{Curve}(R_{\text{norm}}) \cdot \alpha \right) \times 255$$

Where $\alpha = \frac{\text{sCurveRollOff}}{100} \times 0.60$.

---

## 2. Photochemical Halation Simulation

Analog films (such as CineStill 800T and Kodak Vision3) feature an anti-halation layer that is removed during processing. As a result, strong light rays penetrate the emulsion, scatter off the film backing, and expose the red-sensitive bottom layer from behind. This creates an ethereal red/orange glow around high-contrast edges and specular points.

### Pipeline Implementation:
1. **Luminance Threshold Filtering**: Extract all pixels where luminance exceeds $L > 185$.
2. **Chromatic Red-Dominant Shift**:
   $$H_r = 255 \cdot f, \quad H_g = 60 \cdot f, \quad H_b = 20 \cdot f$$
   Where $f = \frac{L - 185}{255 - 185}$.
3. **Specular Diffusion Convolution**: Blurs the halation mask with a Gaussian radius relative to the canvas resolution.
4. **Screen Blend Mode Compositing**: Blends the diffused mask onto the graded canvas using `ctx.globalCompositeOperation = 'screen'`.

---

## 3. Luminance-Adaptive Film Grain

Unlike flat Gaussian digital noise, silver-halide grains in physical film develop non-linearly across the exposure curve. Grains are clumped densely in the **Zone V midtones**, while diminishing in deep shadows and pure specular highlights.

### Algorithm:
For each pixel with luminance $L$:
$$\text{Weight}_{\text{midtone}} = \max\left(0.2, 1 - \frac{|L - 128|}{128}\right)$$
$$\text{Noise} = (\text{rand}() - 0.5) \times \text{GrainAmount} \times \text{Weight}_{\text{midtone}}$$

The grain buffer is then blended using `ctx.globalCompositeOperation = 'overlay'`.

---

## 4. 3-Way Split Toning (Lift, Gamma, Gain)

Split toning injects complementary or analogous color tones into shadows and highlights:
* **Shadows (Lift)**: When $L < \text{Midpoint}$, injects shadow hue/saturation weighted by distance from midpoint:
  $$\Delta_{\text{shadow}} = \frac{\text{Midpoint} - L}{\text{Midpoint}}$$
* **Highlights (Gain)**: When $L > \text{Midpoint}$, injects highlight hue/saturation weighted by:
  $$\Delta_{\text{highlight}} = \frac{L - \text{Midpoint}}{255 - \text{Midpoint}}$$

---

## 5. Industry-Standard .CUBE 3D LUT Generation

A 3D Look-Up Table maps an input RGB triplet to an output RGB triplet by interpolating within a discrete 3D color cube. AuraLens Pro generates standard $33 \times 33 \times 33$ 3D LUTs ($35,937$ points).

### `.CUBE` File Format Structure:
```text
# AuraLens Pro — AI Studio 3D LUT
TITLE "AuraLens_AI_MasterGrade"
LUT_3D_SIZE 33
DOMAIN_MIN 0.0 0.0 0.0
DOMAIN_MAX 1.0 1.0 1.0

0.000000 0.000000 0.000000
0.031250 0.000000 0.000000
...
1.000000 1.000000 1.000000
```

These generated `.cube` files are 100% compatible with:
* **DaVinci Resolve**
* **Adobe Premiere Pro & After Effects**
* **Final Cut Pro**
* **Adobe Photoshop & Lightroom**
* **OBS Studio & Hardware Field Monitors**
