#

## Features

- 🚀 Easy integration with React applications
- 🎯 Target demonstrations based on user attributes
- 🔄 Real-time updates and synchronization
- 📱 Responsive design for all devices
- ⚡ Lightweight and performant
- 🛠️ Highly customizable

## Documentation

For detailed documentation, visit [demopenguin.com](https://demopenguin.com)

## Example
Add the DemoPenguin component to your root layout component.

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <DemoPenguin
          clientToken="client-token"
          userId="user-id"
          userEmail="user-email"
          firstName="user-first-name"
          lastName="user-last-name"
          additionalInfo={{
            company: "user-company",
            role: "user-role"
          }}
        >
          {children}
        </DemoPenguin>
      </body>
    </html>
  );
}
```

## Contributing

1. Fork it ([https://github.com/thedogwiththedataonit/demoPenguin/fork](https://github.com/thedogwiththedataonit/demoPenguin/fork))
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -am 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a new Pull Request

## License

Distributed under the MIT license. See `LICENSE` for more information.

## Links

- Website: [demopenguin.com](https://demopenguin.com)
- Repository: [github.com/thedogwiththedataonit/demoPenguin](https://github.com/thedogwiththedataonit/demoPenguin)
- Issue tracker: [github.com/thedogwiththedataonit/demoPenguin/issues](https://github.com/thedogwiththedataonit/demoPenguin/issues)

[npm-image]: https://demopenguin.com/penguin-walking.gif
[npm-url]: https://npmjs.org/package/demo-penguin
[npm-downloads]: https://img.shields.io/npm/dm/demo-penguin.svg?style=flat-square

