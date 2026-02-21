with open('/Users/mac/Desktop/Saiisai/saiisaiweb/src/features/products/HomePage.jsx', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if line.startswith('const HeroSection = styled.div`'):
        skip = True
    if line.startswith('export default HomePage;'):
        skip = False
    if not skip:
        out.append(line)

with open('/Users/mac/Desktop/Saiisai/saiisaiweb/src/features/products/HomePage.jsx', 'w') as f:
    f.writelines(out)
