"use client";

import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

// Un solo lugar donde se registran los plugins (todos vienen gratis en el paquete gsap).
gsap.registerPlugin(useGSAP, MotionPathPlugin, Draggable, InertiaPlugin, Flip);

export { gsap, useGSAP, Draggable, Flip, InertiaPlugin, MotionPathPlugin };
