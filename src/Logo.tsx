import * as React from "react"
import {
  chakra,
  keyframes,
  ImageProps,
  forwardRef,
  usePrefersReducedMotion,
} from "@chakra-ui/react"
import logo from "./assets/images/keyspace-stack-transparent.svg"


const float = keyframes`
  0% { transform: translate(0,  0px); }
  50% { transform: translate(0, 20px); }
  100% { transform: translate(0, -20px); }
`

export const Logo = forwardRef<ImageProps, "img">((props, ref) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  const animation = prefersReducedMotion
    ? undefined
    : `${float} infinite 20s linear`

  return <chakra.img src={logo} ref={ref} {...props} />
})
