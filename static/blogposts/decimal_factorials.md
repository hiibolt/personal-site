---
title: Decimal Factorials with the Gamma Function
description: Showing a Rust implementation of the Gamma Function, which allows estimation of factorials beyond their normal limits.
slug: decimal-factorial
date: 2023-11-17 15:14:53-0600
image: https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Gamma_plot.svg/650px-Gamma_plot.svg.png
categories:
    - Blog Post
tags:
    - Rust
    - Math
---

This article guides you through the process of creating a lightweight, zero-dependency Rust crate dedicated to computing decimal factorials using the Gamma Function.

With a focus on simplicity and performance, we'll explore the inherent power of Rust and the versatility of the Gamma Function to develop a standalone solution for factorial calculations.

## Explanation - 

Before we delve into the implementation, let's talk about what a factorial is.

A standard factorial $n!$ is defined as:
$$
n! = n * (n-1) \text{ where } 0! = 1
$$

For instance, $4!$ expands to $24$ as follows: 
$$
4! = 4(4 - 1)(4 - 2)(4 - 3)0!
$$

A one-line implementation of a standard factorial is as follows: 
```rust
let n = 4;

let standard_factorial = (1i64..=n.max(1))
        .fold(1i64, |acc, item| {
            acc * item
        });

assert_eq!(standard_factorial, 24);
```
This works by creating a [`Range`](https://doc.rust-lang.org/std/ops/struct.Range.html) from 1 to n (or 1, whichever is greater), which implements [`Iterator`](https://doc.rust-lang.org/std/iter/trait.Iterator.html) conveniently. We then use the built in `fold` function to multiple all elements to each other, effectively creating a basic factorial function.

You may notice that the input `n` is of datatype `i64`. This is intentional - this function **does not work for non-integers**! In fact, there is no such implementation that does - or is there?

The [**Gamma Function**](https://en.wikipedia.org/wiki/Gamma_function) is a formula that allows the input of any $x \in \mathbb{R}$.
$$\Gamma(x) = \int_0^{\infty}{t^{x-1}}e^tdt$$
For all values $x \in \mathbb{R} \text{ and } x \ge 0$, 
$$\Gamma(x + 1) = x!$$
This holds true for all integers - and allows us to calculate decimal values of x! But hold on a minute, that's a definite integral! Last I checked, Rust doesn't deal with calculus. Well, thankfully, when integrated, the **Gamma Function** exhibits a clear pattern.

After using [integration by parts](https://en.wikipedia.org/wiki/Integration_by_parts), we're left with this:
$$\Gamma(x + 1) = \lim_{t \rightarrow \infty}{-t^xe^t}-(-0^xe^{-0})+x\int_0^{\infty}{t^{x-1}e^{-t}}dt$$
The leftmost and middle terms reduce to 0, leaving
$$\Gamma(x + 1) = x\int_0^{\infty}{t^{x-1}e^{-t}}dt$$
or...
$$\Gamma(x + 1) = x\Gamma(x)$$
For instance, with $\Gamma(4.02 + 1)$ (or $4.02!$):
$$\Gamma(5.02) = (4.02)(3.02)(2.02)(1.02)\int_0^{\infty}{t^{0.02}e^{-t}}dt$$

That first part won't be too difficult to implement, but what about the second?

We'll need to approximate that integral. We'll use a technique called LRAM, or [**Left Reimann Approximation**](https://tutorial.math.lamar.edu/Classes/CalcII/ApproximatingDefIntegrals.aspx).

![Left and Right Sum](https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.storyofmathematics.com%2Fwp-content%2Fuploads%2F2021%2F05%2Fleft-and-right-riemann-sum-graph.png&f=1&nofb=1&ipt=efa408551b265bbc9e456d60e69a94dbf97f51396a7f853e951282bea428da89&ipo=images)

## Setup - 

Let's start by creating our project workspace with Cargo!
```bash
cargo init
```

## Implementation - 

We essentially add up rectangular areas of $f(x) * step$. I implemented this as follows: 

```rust
fn definite_integral(f: impl Fn(f64) -> f64, lower: f64, upper: f64, step: f64) -> f64 {
    let mut area: f64 = 0f64;

    let mut x: f64 = lower;
    let mut step: f64 = step;
    while x < upper {
        if (x + step) > upper {
            step = upper - x;
        }

        area += step * f(x);

        x += step;
    }

    area
}
```

This allows us to estimate that last part, so we can go ahead and start implementing everything.

We'll start by modifying our `standard_factorial` function so that it works for floats:
```rust
let standard_factorial = (1i64..=n.max(1f64) as i64)
        .fold(1f64, |acc, item| {
            acc * (item as f64 + n % 1f64)
        });
```

This will calculate the $(x)(x - 1)...(x - \lfloor{x}\rfloor + 1)$ portion of our equation. Next, we need to get the factorial of the decimal with our newly implemented integral estimation.

```rust
let decimal_factorial = definite_integral(|x| x.powf(n - n.floor()) * ((-x).exp()), 0f64, 1000f64, 0.0001f64);
```

Infinity isn't exactly an `f64`, so I'll use 1000 for our upper bound with a step of 0.0001. 

Finally, we need to handle two edge cases: $x < 0$ and $x = \lfloor{x}\rfloor$. The prior because the Gamma Function is inaccurate behind zero, and the latter for the sake of accuracy.

```rust
fn gamma_function(n: f64) -> f64 {
    if n < 0f64 {
        panic!("The Gamma Function is not accurate for negative values!");
    }

    let standard_factorial = (1i64..=n.max(1f64) as i64)
        .fold(1f64, |acc, item| {
            acc * (item as f64 + n % 1f64)
        });

    if n % 1f64 == 0f64 {
        return standard_factorial as f64;
    }

    let decimal_factorial = definite_integral(|x| x.powf(n - n.floor()) * ((-x).exp()), 0f64, 1000f64, 0.0001f64);

    standard_factorial as f64 * decimal_factorial
}
```

Nice! If all is done correctly, you have a fully functional implementation of decimal factorials with the Gamma Function.

It's important that you tweak the constants to your own application for accuracy that suits your needs. I will also note that we chose **Left Riemann Sum** as our method of approximation. While very easy to implement, it's not accurate! A significantly more accurate method is [**Simpson's Rule**](https://tutorial.math.lamar.edu/Classes/CalcII/ApproximatingDefIntegrals.aspx) - with little extra computation cost.

## Result - 
```rust
fn definite_integral(f: impl Fn(f64) -> f64, lower: f64, upper: f64, step: f64) -> f64 {
    let mut area: f64 = 0f64;

    let mut x: f64 = lower;
    let mut step: f64 = step;
    while x < upper {
        if (x + step) > upper {
            step = upper - x;
        }

        area += step * f(x);

        x += step;
    }

    area
}
fn gamma_function(n: f64) -> f64 {
    if n < 0f64 {
        panic!("The Gamma Function is not accurate for negative values!");
    }

    let standard_factorial = (1i64..=n.max(1f64) as i64)
        .fold(1f64, |acc, item| {
            acc * (item as f64 + n % 1f64)
        });

    if n % 1f64 == 0f64 {
        return standard_factorial as f64;
    }

    let decimal_factorial = definite_integral(|x| x.powf(n - n.floor()) * ((-x).exp()), 0f64, 1000f64, 0.0001f64);

    standard_factorial as f64 * decimal_factorial
}
fn main() {
    let answer = gamma_function(4.02f64);

    println!("4.02! = {answer}")
}
```

## Outro - 
Hopefully you found this article informative or helpful. If you did, follow my [**GitHub**](https://socials.hiibolt.com/github)!

I often write these articles after struggling to find good documentation on a concept. That means there's often a large-scale project on there related to this article, if you'd like to see it in practice! In this case, I needed a decimal factorial for my memory model project [**monikaiv2**](https://github.com/hiibolt/monikaiv2) - but didn't want the overhead of adding a crate.
