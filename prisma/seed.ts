import { PrismaClient, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

async function createProblem(
  topicId: string,
  title: string,
  body: string,
  solution: string,
  difficulty: Difficulty
) {
  return prisma.problem.create({
    data: { topicId, title, body, solution, difficulty },
  });
}

async function main() {
  // Clear existing data in dependency order
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.userProblem.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.topic.deleteMany();

  // ── Top-level Topics ──────────────────────────────────────────────
  const calculus = await prisma.topic.create({
    data: { name: "Calculus", slug: "calculus", description: "Single and multivariable calculus", order: 0 },
  });
  const linearAlgebra = await prisma.topic.create({
    data: { name: "Linear Algebra", slug: "linear-algebra", description: "Vector spaces, matrices, and linear transformations", order: 1 },
  });
  const statistics = await prisma.topic.create({
    data: { name: "Statistics", slug: "statistics", description: "Probability, distributions, and statistical inference", order: 2 },
  });
  const discreteMath = await prisma.topic.create({
    data: { name: "Discrete Mathematics", slug: "discrete-mathematics", description: "Logic, combinatorics, and graph theory", order: 3 },
  });
  const realAnalysis = await prisma.topic.create({
    data: { name: "Real Analysis", slug: "real-analysis", description: "Rigorous foundations of calculus and metric spaces", order: 4 },
  });

  // ── Helper to create a subtopic ───────────────────────────────────
  async function sub(parentId: string, name: string, slug: string, desc: string, order: number) {
    return prisma.topic.create({
      data: { name, slug, description: desc, parentId, order },
    });
  }

  // ── Calculus Subtopics ────────────────────────────────────────────
  const limits = await sub(calculus.id, "Limits", "limits", "Limits and continuity", 0);
  const derivatives = await sub(calculus.id, "Derivatives", "derivatives", "Differentiation techniques", 1);
  const integration = await sub(calculus.id, "Integration", "integration", "Integral calculus", 2);
  const series = await sub(calculus.id, "Series", "series", "Infinite series and convergence", 3);
  const multivar = await sub(calculus.id, "Multivariable Calculus", "multivariable-calculus", "Partial derivatives and multiple integrals", 4);

  // ── Linear Algebra Subtopics ──────────────────────────────────────
  const vectors = await sub(linearAlgebra.id, "Vectors and Spaces", "vectors-and-spaces", "Vector spaces and subspaces", 0);
  const matrices = await sub(linearAlgebra.id, "Matrices", "matrices", "Matrix algebra and decompositions", 1);
  const eigenvalues = await sub(linearAlgebra.id, "Eigenvalues", "eigenvalues", "Eigenvalues and eigenvectors", 2);
  const linearTransformations = await sub(linearAlgebra.id, "Linear Transformations", "linear-transformations", "Maps between vector spaces", 3);
  const innerProduct = await sub(linearAlgebra.id, "Inner Product Spaces", "inner-product-spaces", "Inner products and orthogonality", 4);

  // ── Statistics Subtopics ──────────────────────────────────────────
  const probability = await sub(statistics.id, "Probability", "probability", "Probability theory and axioms", 0);
  const distributions = await sub(statistics.id, "Distributions", "distributions", "Common probability distributions", 1);
  const hypothesis = await sub(statistics.id, "Hypothesis Testing", "hypothesis-testing", "Statistical hypothesis testing", 2);
  const regression = await sub(statistics.id, "Regression", "regression", "Linear and nonlinear regression", 3);
  const bayesian = await sub(statistics.id, "Bayesian Statistics", "bayesian-statistics", "Bayesian inference and priors", 4);

  // ── Discrete Math Subtopics ───────────────────────────────────────
  const logic = await sub(discreteMath.id, "Logic", "logic", "Propositional and predicate logic", 0);
  const setsRelations = await sub(discreteMath.id, "Sets and Relations", "sets-and-relations", "Set theory and relations", 1);
  const combinatorics = await sub(discreteMath.id, "Combinatorics", "combinatorics", "Counting and enumeration", 2);
  const graphTheory = await sub(discreteMath.id, "Graph Theory", "graph-theory", "Graphs, trees, and networks", 3);
  const numberTheory = await sub(discreteMath.id, "Number Theory", "number-theory", "Divisibility, primes, and modular arithmetic", 4);

  // ── Real Analysis Subtopics ───────────────────────────────────────
  const sequences = await sub(realAnalysis.id, "Sequences and Limits", "sequences-and-limits", "Convergence of sequences", 0);
  const continuity = await sub(realAnalysis.id, "Continuity", "continuity", "Continuous functions and properties", 1);
  const differentiation = await sub(realAnalysis.id, "Differentiation", "differentiation", "Differentiability and the mean value theorem", 2);
  const riemannIntegration = await sub(realAnalysis.id, "Riemann Integration", "riemann-integration", "Riemann sums and integrability", 3);
  const metricSpaces = await sub(realAnalysis.id, "Metric Spaces", "metric-spaces", "Metric spaces, open and closed sets", 4);

  // ══════════════════════════════════════════════════════════════════
  //  PROBLEMS
  // ══════════════════════════════════════════════════════════════════

  // ── Limits ────────────────────────────────────────────────────────
  await createProblem(limits.id, "Basic Limit Evaluation",
    "Evaluate the limit:\n$$\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}$$",
    "Factor the numerator:\n$$\\frac{x^2-4}{x-2} = \\frac{(x-2)(x+2)}{x-2} = x+2$$\nThus $\\lim_{x \\to 2}(x+2) = 4$.",
    Difficulty.EASY);
  await createProblem(limits.id, "Trigonometric Limit",
    "Evaluate:\n$$\\lim_{x \\to 0} \\frac{\\sin 3x}{x}$$",
    "Rewrite as $3 \\cdot \\frac{\\sin 3x}{3x}$. Since $\\lim_{u\\to 0}\\frac{\\sin u}{u}=1$, the answer is $3$.",
    Difficulty.EASY);
  await createProblem(limits.id, "L'Hôpital's Rule",
    "Evaluate:\n$$\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}$$",
    "Apply L'Hôpital twice. First: $\\frac{e^x -1}{2x}$. Second: $\\frac{e^x}{2}$. At $x=0$ this gives $\\frac{1}{2}$.",
    Difficulty.MEDIUM);
  await createProblem(limits.id, "Squeeze Theorem",
    "Use the Squeeze Theorem to evaluate:\n$$\\lim_{x \\to 0} x^2 \\sin\\!\\left(\\frac{1}{x}\\right)$$",
    "Since $-1 \\le \\sin(1/x) \\le 1$, we have $-x^2 \\le x^2\\sin(1/x) \\le x^2$. Both bounds tend to $0$, so the limit is $0$.",
    Difficulty.MEDIUM);
  await createProblem(limits.id, "Limit at Infinity with Radicals",
    "Evaluate:\n$$\\lim_{x \\to \\infty} \\left(\\sqrt{x^2+x} - x\\right)$$",
    "Multiply by $\\frac{\\sqrt{x^2+x}+x}{\\sqrt{x^2+x}+x}$:\n$$\\frac{x}{\\sqrt{x^2+x}+x} = \\frac{1}{\\sqrt{1+1/x}+1} \\to \\frac{1}{2}$$",
    Difficulty.HARD);

  // ── Derivatives ───────────────────────────────────────────────────
  await createProblem(derivatives.id, "Power Rule",
    "Find $f'(x)$ for $f(x)=x^5 - 3x^3 + 2x$.",
    "$f'(x)=5x^4 - 9x^2 + 2$.",
    Difficulty.EASY);
  await createProblem(derivatives.id, "Product Rule",
    "Find the derivative of $f(x) = x^2 e^x$.",
    "By the product rule: $f'(x)=2xe^x + x^2 e^x = e^x(x^2+2x)$.",
    Difficulty.EASY);
  await createProblem(derivatives.id, "Chain Rule",
    "Find $\\frac{d}{dx}\\sin(x^3)$.",
    "By the chain rule: $\\cos(x^3)\\cdot 3x^2 = 3x^2\\cos(x^3)$.",
    Difficulty.MEDIUM);
  await createProblem(derivatives.id, "Implicit Differentiation",
    "Given $x^2 + y^2 = 25$, find $\\frac{dy}{dx}$.",
    "Differentiate both sides: $2x + 2y\\frac{dy}{dx}=0$, so $\\frac{dy}{dx}=-\\frac{x}{y}$.",
    Difficulty.MEDIUM);
  await createProblem(derivatives.id, "Logarithmic Differentiation",
    "Find $\\frac{d}{dx} x^x$ for $x>0$.",
    "Let $y=x^x$, so $\\ln y = x\\ln x$. Differentiate: $\\frac{y'}{y}=\\ln x + 1$. Thus $y' = x^x(\\ln x+1)$.",
    Difficulty.HARD);

  // ── Integration ───────────────────────────────────────────────────
  await createProblem(integration.id, "Basic Antiderivative",
    "Evaluate $\\displaystyle\\int (3x^2+2x-1)\\,dx$.",
    "$x^3 + x^2 - x + C$.",
    Difficulty.EASY);
  await createProblem(integration.id, "Substitution",
    "Evaluate $\\displaystyle\\int 2x\\cos(x^2)\\,dx$.",
    "Let $u=x^2$, $du=2x\\,dx$. Then $\\int \\cos u\\,du = \\sin u + C = \\sin(x^2)+C$.",
    Difficulty.EASY);
  await createProblem(integration.id, "Integration by Parts",
    "Evaluate $\\displaystyle\\int x e^x\\,dx$.",
    "Let $u=x$, $dv=e^x dx$. Then $du=dx$, $v=e^x$. So $xe^x - \\int e^x dx = xe^x - e^x + C = e^x(x-1)+C$.",
    Difficulty.MEDIUM);
  await createProblem(integration.id, "Partial Fractions",
    "Evaluate $\\displaystyle\\int \\frac{1}{x^2-1}\\,dx$.",
    "Write $\\frac{1}{x^2-1}=\\frac{1}{2}\\left(\\frac{1}{x-1}-\\frac{1}{x+1}\\right)$. Integrating: $\\frac{1}{2}\\ln\\left|\\frac{x-1}{x+1}\\right|+C$.",
    Difficulty.MEDIUM);
  await createProblem(integration.id, "Trigonometric Integral",
    "Evaluate $\\displaystyle\\int_0^{\\pi/2} \\sin^2 x\\,dx$.",
    "Use $\\sin^2 x = \\frac{1-\\cos 2x}{2}$. Then $\\int_0^{\\pi/2}\\frac{1-\\cos 2x}{2}dx = \\frac{1}{2}\\left[x-\\frac{\\sin 2x}{2}\\right]_0^{\\pi/2}=\\frac{\\pi}{4}$.",
    Difficulty.HARD);

  // ── Series ────────────────────────────────────────────────────────
  await createProblem(series.id, "Geometric Series",
    "Find the sum $\\displaystyle\\sum_{n=0}^{\\infty}\\frac{1}{2^n}$.",
    "This is a geometric series with $a=1$, $r=1/2$. Sum $=\\frac{1}{1-1/2}=2$.",
    Difficulty.EASY);
  await createProblem(series.id, "Divergence Test",
    "Show that $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{n}{n+1}$ diverges.",
    "Since $\\lim_{n\\to\\infty}\\frac{n}{n+1}=1\\neq 0$, the series diverges by the Divergence Test.",
    Difficulty.EASY);
  await createProblem(series.id, "Ratio Test",
    "Determine convergence of $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{n!}{n^n}$.",
    "By the Ratio Test: $\\frac{a_{n+1}}{a_n}=\\frac{(n+1)!}{(n+1)^{n+1}}\\cdot\\frac{n^n}{n!}=\\left(\\frac{n}{n+1}\\right)^n\\to e^{-1}<1$. The series converges.",
    Difficulty.MEDIUM);
  await createProblem(series.id, "Taylor Series",
    "Find the Maclaurin series for $f(x)=\\ln(1+x)$.",
    "$\\ln(1+x)=\\sum_{n=1}^{\\infty}(-1)^{n+1}\\frac{x^n}{n}$ for $|x|\\le 1$ (excluding $x=-1$).",
    Difficulty.MEDIUM);
  await createProblem(series.id, "Power Series Radius of Convergence",
    "Find the radius of convergence of $\\displaystyle\\sum_{n=0}^{\\infty}\\frac{x^n}{n!}$.",
    "By the Ratio Test: $\\left|\\frac{x^{n+1}/(n+1)!}{x^n/n!}\\right|=\\frac{|x|}{n+1}\\to 0$ for all $x$. The radius of convergence is $R=\\infty$.",
    Difficulty.HARD);

  // ── Multivariable Calculus ────────────────────────────────────────
  await createProblem(multivar.id, "Partial Derivatives",
    "Find $\\frac{\\partial f}{\\partial x}$ and $\\frac{\\partial f}{\\partial y}$ for $f(x,y)=x^2y+\\sin(xy)$.",
    "$f_x = 2xy + y\\cos(xy)$ and $f_y = x^2 + x\\cos(xy)$.",
    Difficulty.EASY);
  await createProblem(multivar.id, "Gradient Vector",
    "Compute $\\nabla f$ for $f(x,y,z)=x^2+y^2+z^2$.",
    "$\\nabla f = (2x, 2y, 2z)$.",
    Difficulty.EASY);
  await createProblem(multivar.id, "Double Integral",
    "Evaluate $\\displaystyle\\iint_R xy\\,dA$ where $R=[0,1]\\times[0,2]$.",
    "$\\int_0^1\\int_0^2 xy\\,dy\\,dx = \\int_0^1 x\\left[\\frac{y^2}{2}\\right]_0^2 dx = \\int_0^1 2x\\,dx = 1$.",
    Difficulty.MEDIUM);
  await createProblem(multivar.id, "Lagrange Multipliers",
    "Use Lagrange multipliers to find the maximum of $f(x,y)=xy$ subject to $x^2+y^2=1$.",
    "Set $\\nabla f=\\lambda\\nabla g$: $y=2\\lambda x$, $x=2\\lambda y$. From these, $x^2=y^2$. With the constraint $2x^2=1$, so $x=y=\\frac{1}{\\sqrt{2}}$ giving max $f=\\frac{1}{2}$.",
    Difficulty.HARD);
  await createProblem(multivar.id, "Stokes' Theorem",
    "Verify Stokes' theorem for $\\mathbf{F}=(-y,x,0)$ over the hemisphere $z=\\sqrt{1-x^2-y^2}$.",
    "$\\operatorname{curl}\\mathbf{F}=(0,0,2)$. The surface integral is $\\iint_S 2\\,dS = 2\\pi$ (projected area of the unit disk). The line integral around the unit circle $\\oint(-y\\,dx+x\\,dy)=\\int_0^{2\\pi}(\\sin^2 t+\\cos^2 t)dt=2\\pi$. Both agree.",
    Difficulty.HARD);

  // ── Vectors and Spaces ────────────────────────────────────────────
  await createProblem(vectors.id, "Linear Independence",
    "Determine if $\\{(1,2,3),(4,5,6),(7,8,9)\\}$ is linearly independent in $\\mathbb{R}^3$.",
    "Form the matrix and row-reduce. The determinant is $1(45-48)-2(36-42)+3(32-35)=0$. The vectors are linearly dependent.",
    Difficulty.EASY);
  await createProblem(vectors.id, "Span and Subspace",
    "Show that $W=\\{(x,y,z)\\in\\mathbb{R}^3 : x+y+z=0\\}$ is a subspace of $\\mathbb{R}^3$.",
    "$W$ contains $\\mathbf{0}$. If $\\mathbf{u},\\mathbf{v}\\in W$ then $(u_1+v_1)+(u_2+v_2)+(u_3+v_3)=0+0=0$ so $\\mathbf{u}+\\mathbf{v}\\in W$. Similarly for scalar multiplication. Hence $W$ is a subspace.",
    Difficulty.EASY);
  await createProblem(vectors.id, "Basis of a Subspace",
    "Find a basis for the null space of $A=\\begin{pmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{pmatrix}$.",
    "Row reduce to $\\begin{pmatrix}1&0&-1\\\\0&1&2\\\\0&0&0\\end{pmatrix}$. Setting $x_3=t$: $(t,-2t,t)=t(1,-2,1)$. A basis is $\\{(1,-2,1)\\}$.",
    Difficulty.MEDIUM);
  await createProblem(vectors.id, "Dimension Theorem",
    "Let $T:\\mathbb{R}^4\\to\\mathbb{R}^3$ be linear with $\\dim(\\ker T)=2$. Find $\\dim(\\operatorname{im} T)$.",
    "By the rank-nullity theorem: $\\dim(\\mathbb{R}^4)=\\dim(\\ker T)+\\dim(\\operatorname{im} T)$, so $4=2+\\dim(\\operatorname{im} T)$, giving $\\dim(\\operatorname{im} T)=2$.",
    Difficulty.MEDIUM);
  await createProblem(vectors.id, "Direct Sum of Subspaces",
    "Let $U=\\{(x,0):x\\in\\mathbb{R}\\}$ and $W=\\{(0,y):y\\in\\mathbb{R}\\}$. Prove $\\mathbb{R}^2=U\\oplus W$.",
    "Any $(a,b)\\in\\mathbb{R}^2$ can be written as $(a,0)+(0,b)$ with $(a,0)\\in U$ and $(0,b)\\in W$. If $(x,0)+(0,y)=(0,0)$ then $x=y=0$, so $U\\cap W=\\{\\mathbf{0}\\}$. Therefore $\\mathbb{R}^2=U\\oplus W$.",
    Difficulty.HARD);

  // ── Matrices ──────────────────────────────────────────────────────
  await createProblem(matrices.id, "Matrix Multiplication",
    "Compute $AB$ where $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ and $B=\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix}$.",
    "$AB=\\begin{pmatrix}1\\cdot5+2\\cdot7&1\\cdot6+2\\cdot8\\\\3\\cdot5+4\\cdot7&3\\cdot6+4\\cdot8\\end{pmatrix}=\\begin{pmatrix}19&22\\\\43&50\\end{pmatrix}$.",
    Difficulty.EASY);
  await createProblem(matrices.id, "Determinant Computation",
    "Find $\\det\\begin{pmatrix}2&1&3\\\\0&-1&2\\\\1&4&-1\\end{pmatrix}$.",
    "Expand along the first row: $2((-1)(-1)-(2)(4))-1((0)(-1)-(2)(1))+3((0)(4)-(-1)(1))=2(1-8)-1(0-2)+3(0+1)=-14+2+3=-9$.",
    Difficulty.MEDIUM);
  await createProblem(matrices.id, "Matrix Inverse",
    "Find the inverse of $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$.",
    "$\\det A=4-6=-2$. So $A^{-1}=\\frac{1}{-2}\\begin{pmatrix}4&-2\\\\-3&1\\end{pmatrix}=\\begin{pmatrix}-2&1\\\\3/2&-1/2\\end{pmatrix}$.",
    Difficulty.MEDIUM);
  await createProblem(matrices.id, "LU Decomposition",
    "Find an LU decomposition of $A=\\begin{pmatrix}2&4\\\\1&5\\end{pmatrix}$.",
    "$L=\\begin{pmatrix}1&0\\\\1/2&1\\end{pmatrix}$, $U=\\begin{pmatrix}2&4\\\\0&3\\end{pmatrix}$. Verify: $LU=\\begin{pmatrix}2&4\\\\1&5\\end{pmatrix}=A$.",
    Difficulty.HARD);
  await createProblem(matrices.id, "Rank of a Matrix",
    "Find the rank of $A=\\begin{pmatrix}1&2&3\\\\2&4&6\\\\1&3&4\\end{pmatrix}$.",
    "Row reduce: $R_2\\to R_2-2R_1$, $R_3\\to R_3-R_1$ gives $\\begin{pmatrix}1&2&3\\\\0&0&0\\\\0&1&1\\end{pmatrix}$. Swap $R_2,R_3$: two pivots, so $\\operatorname{rank}(A)=2$.",
    Difficulty.EASY);

  // ── Eigenvalues ───────────────────────────────────────────────────
  await createProblem(eigenvalues.id, "2x2 Eigenvalues",
    "Find the eigenvalues of $A=\\begin{pmatrix}4&1\\\\2&3\\end{pmatrix}$.",
    "$\\det(A-\\lambda I)=(4-\\lambda)(3-\\lambda)-2=\\lambda^2-7\\lambda+10=(\\lambda-5)(\\lambda-2)=0$. Eigenvalues: $\\lambda=2,5$.",
    Difficulty.EASY);
  await createProblem(eigenvalues.id, "Eigenvectors",
    "Find the eigenvectors of $A=\\begin{pmatrix}2&1\\\\0&3\\end{pmatrix}$.",
    "For $\\lambda=2$: $(A-2I)\\mathbf{v}=0$ gives $v_2=0$, so $\\mathbf{v}_1=(1,0)^T$. For $\\lambda=3$: $(A-3I)\\mathbf{v}=0$ gives $-v_1+v_2=0$, so $\\mathbf{v}_2=(1,1)^T$.",
    Difficulty.EASY);
  await createProblem(eigenvalues.id, "Diagonalization",
    "Diagonalize $A=\\begin{pmatrix}3&1\\\\0&2\\end{pmatrix}$.",
    "Eigenvalues: $\\lambda_1=3$, $\\lambda_2=2$ with eigenvectors $(1,0)^T$ and $(1,-1)^T$. Let $P=\\begin{pmatrix}1&1\\\\0&-1\\end{pmatrix}$. Then $A=P\\begin{pmatrix}3&0\\\\0&2\\end{pmatrix}P^{-1}$.",
    Difficulty.MEDIUM);
  await createProblem(eigenvalues.id, "Cayley-Hamilton Theorem",
    "Verify the Cayley-Hamilton theorem for $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$.",
    "Characteristic polynomial: $\\lambda^2-5\\lambda-2=0$. Compute $A^2-5A-2I=\\begin{pmatrix}7&10\\\\15&22\\end{pmatrix}-\\begin{pmatrix}5&10\\\\15&20\\end{pmatrix}-\\begin{pmatrix}2&0\\\\0&2\\end{pmatrix}=\\begin{pmatrix}0&0\\\\0&0\\end{pmatrix}$. ✓",
    Difficulty.MEDIUM);
  await createProblem(eigenvalues.id, "Spectral Theorem Application",
    "Let $A=\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$. Find an orthogonal matrix $Q$ that diagonalizes $A$.",
    "Eigenvalues: $3,1$. Eigenvectors: $\\frac{1}{\\sqrt{2}}(1,1)^T$ and $\\frac{1}{\\sqrt{2}}(1,-1)^T$. So $Q=\\frac{1}{\\sqrt{2}}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$ and $Q^TAQ=\\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}$.",
    Difficulty.HARD);

  // ── Linear Transformations ────────────────────────────────────────
  await createProblem(linearTransformations.id, "Matrix of a Transformation",
    "Find the standard matrix for the linear transformation $T:\\mathbb{R}^2\\to\\mathbb{R}^2$ defined by $T(x,y)=(2x+y, x-y)$.",
    "Apply $T$ to standard basis: $T(1,0)=(2,1)$, $T(0,1)=(1,-1)$. Matrix: $A=\\begin{pmatrix}2&1\\\\1&-1\\end{pmatrix}$.",
    Difficulty.EASY);
  await createProblem(linearTransformations.id, "Kernel of a Transformation",
    "Find $\\ker T$ where $T:\\mathbb{R}^3\\to\\mathbb{R}^2$ is given by $T(x,y,z)=(x+y, y+z)$.",
    "Solve $x+y=0$ and $y+z=0$. So $x=-y$ and $z=-y$. Setting $y=t$: $\\ker T=\\{t(-1,1,-1):t\\in\\mathbb{R}\\}$.",
    Difficulty.MEDIUM);
  await createProblem(linearTransformations.id, "Composition of Transformations",
    "Let $S(x,y)=(x+y,x)$ and $T(x,y)=(2x,y-x)$. Find the matrix of $T\\circ S$.",
    "$[S]=\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}$, $[T]=\\begin{pmatrix}2&0\\\\-1&1\\end{pmatrix}$. $[T\\circ S]=\\begin{pmatrix}2&0\\\\-1&1\\end{pmatrix}\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}=\\begin{pmatrix}2&2\\\\0&-1\\end{pmatrix}$.",
    Difficulty.MEDIUM);
  await createProblem(linearTransformations.id, "Rotation Matrix",
    "Find the matrix of the rotation by $\\theta=\\pi/4$ in $\\mathbb{R}^2$.",
    "$R=\\begin{pmatrix}\\cos(\\pi/4)&-\\sin(\\pi/4)\\\\\\sin(\\pi/4)&\\cos(\\pi/4)\\end{pmatrix}=\\frac{1}{\\sqrt{2}}\\begin{pmatrix}1&-1\\\\1&1\\end{pmatrix}$.",
    Difficulty.EASY);
  await createProblem(linearTransformations.id, "Isomorphism Check",
    "Show that $T:\\mathbb{R}^2\\to\\mathbb{R}^2$ given by $T(x,y)=(x+y,x-y)$ is an isomorphism.",
    "The matrix is $A=\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}$ with $\\det A = -2 \\neq 0$. Since $A$ is invertible, $T$ is bijective, hence an isomorphism.",
    Difficulty.HARD);

  // ── Inner Product Spaces ──────────────────────────────────────────
  await createProblem(innerProduct.id, "Dot Product",
    "Compute $\\langle\\mathbf{u},\\mathbf{v}\\rangle$ for $\\mathbf{u}=(1,2,3)$ and $\\mathbf{v}=(4,-5,6)$.",
    "$\\langle\\mathbf{u},\\mathbf{v}\\rangle = 1(4)+2(-5)+3(6)=4-10+18=12$.",
    Difficulty.EASY);
  await createProblem(innerProduct.id, "Orthogonal Projection",
    "Find the projection of $\\mathbf{v}=(3,4)$ onto $\\mathbf{u}=(1,0)$.",
    "$\\operatorname{proj}_{\\mathbf{u}}\\mathbf{v}=\\frac{\\langle\\mathbf{v},\\mathbf{u}\\rangle}{\\langle\\mathbf{u},\\mathbf{u}\\rangle}\\mathbf{u}=\\frac{3}{1}(1,0)=(3,0)$.",
    Difficulty.EASY);
  await createProblem(innerProduct.id, "Gram-Schmidt Process",
    "Apply Gram-Schmidt to $\\{(1,1,0),(1,0,1)\\}$.",
    "Let $\\mathbf{u}_1=(1,1,0)$. Then $\\mathbf{u}_2=(1,0,1)-\\frac{1}{2}(1,1,0)=(\\frac{1}{2},-\\frac{1}{2},1)$. Normalizing gives $\\mathbf{e}_1=\\frac{1}{\\sqrt{2}}(1,1,0)$, $\\mathbf{e}_2=\\frac{1}{\\sqrt{6}}(1,-1,2)$.",
    Difficulty.MEDIUM);
  await createProblem(innerProduct.id, "Cauchy-Schwarz Inequality",
    "Prove that for $\\mathbf{u}=(1,2)$ and $\\mathbf{v}=(3,4)$, $|\\langle\\mathbf{u},\\mathbf{v}\\rangle|\\le\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|$.",
    "$|\\langle\\mathbf{u},\\mathbf{v}\\rangle|=|3+8|=11$. $\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|=\\sqrt{5}\\cdot\\sqrt{25}=5\\sqrt{5}\\approx 11.18$. Indeed $11\\le 5\\sqrt{5}$. ✓",
    Difficulty.MEDIUM);
  await createProblem(innerProduct.id, "Orthogonal Complement",
    "Find $W^\\perp$ where $W=\\operatorname{span}\\{(1,1,1)\\}$ in $\\mathbb{R}^3$.",
    "$W^\\perp = \\{(x,y,z): x+y+z=0\\}$. A basis is $\\{(-1,1,0),(-1,0,1)\\}$.",
    Difficulty.HARD);

  // ── Probability ───────────────────────────────────────────────────
  await createProblem(probability.id, "Basic Probability",
    "A fair die is rolled twice. What is the probability the sum is $7$?",
    "There are $36$ equally likely outcomes. Pairs summing to $7$: $(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)$. Probability $= 6/36 = 1/6$.",
    Difficulty.EASY);
  await createProblem(probability.id, "Conditional Probability",
    "A box has 3 red and 2 blue balls. Two are drawn without replacement. Given the first is red, find $P(\\text{second is red})$.",
    "After drawing one red, 2 red and 2 blue remain. $P(\\text{second red}\\mid\\text{first red})=2/4=1/2$.",
    Difficulty.EASY);
  await createProblem(probability.id, "Bayes' Theorem",
    "A test for a disease has sensitivity $0.95$ and specificity $0.90$. If prevalence is $1\\%$, find $P(\\text{disease}\\mid\\text{positive})$.",
    "By Bayes: $P(D|+)=\\frac{0.95\\times0.01}{0.95\\times0.01+0.10\\times0.99}=\\frac{0.0095}{0.0095+0.099}=\\frac{0.0095}{0.1085}\\approx 0.0876$.",
    Difficulty.MEDIUM);
  await createProblem(probability.id, "Law of Total Probability",
    "An urn has 5 white and 3 black balls. A ball is drawn; if white, a fair coin is flipped; if black, a biased coin ($P(H)=0.3$) is flipped. Find $P(H)$.",
    "$P(H)=P(H|W)P(W)+P(H|B)P(B)=0.5\\cdot\\frac{5}{8}+0.3\\cdot\\frac{3}{8}=\\frac{2.5+0.9}{8}=\\frac{3.4}{8}=0.425$.",
    Difficulty.MEDIUM);
  await createProblem(probability.id, "Inclusion-Exclusion",
    "In a class of 30 students, 18 play soccer, 15 play basketball, and 10 play both. How many play neither?",
    "By inclusion-exclusion: $|S\\cup B|=18+15-10=23$. Neither: $30-23=7$.",
    Difficulty.HARD);

  // ── Distributions ─────────────────────────────────────────────────
  await createProblem(distributions.id, "Binomial Distribution",
    "A fair coin is flipped 10 times. Find $P(X=3)$ where $X$ is the number of heads.",
    "$P(X=3)=\\binom{10}{3}(0.5)^3(0.5)^7=120\\cdot\\frac{1}{1024}=\\frac{120}{1024}=\\frac{15}{128}\\approx 0.1172$.",
    Difficulty.EASY);
  await createProblem(distributions.id, "Poisson Distribution",
    "If emails arrive at rate $\\lambda=4$ per hour, find $P(X=2)$ in one hour.",
    "$P(X=2)=\\frac{e^{-4}\\cdot4^2}{2!}=\\frac{16e^{-4}}{2}=8e^{-4}\\approx 0.1465$.",
    Difficulty.EASY);
  await createProblem(distributions.id, "Normal Distribution",
    "Let $X\\sim N(100,15^2)$. Find $P(X>130)$.",
    "$Z=\\frac{130-100}{15}=2$. From the standard normal table: $P(Z>2)=1-\\Phi(2)\\approx1-0.9772=0.0228$.",
    Difficulty.MEDIUM);
  await createProblem(distributions.id, "Exponential Distribution",
    "The lifetime of a lightbulb is exponential with mean 1000 hours. Find $P(X>1500)$.",
    "$\\lambda=1/1000$. $P(X>1500)=e^{-1500/1000}=e^{-3/2}\\approx 0.2231$.",
    Difficulty.MEDIUM);
  await createProblem(distributions.id, "Moment Generating Function",
    "Derive the MGF of $X\\sim\\text{Exp}(\\lambda)$ and use it to find $E[X]$.",
    "$M_X(t)=E[e^{tX}]=\\int_0^\\infty e^{tx}\\lambda e^{-\\lambda x}dx=\\frac{\\lambda}{\\lambda-t}$ for $t<\\lambda$. $E[X]=M_X'(0)=\\frac{\\lambda}{(\\lambda-t)^2}\\big|_{t=0}=\\frac{1}{\\lambda}$.",
    Difficulty.HARD);

  // ── Hypothesis Testing ────────────────────────────────────────────
  await createProblem(hypothesis.id, "Z-Test",
    "A sample of $n=36$ has $\\bar{x}=52$, population $\\sigma=6$, $\\mu_0=50$. Test $H_0:\\mu=50$ vs $H_1:\\mu>50$ at $\\alpha=0.05$.",
    "$z=\\frac{52-50}{6/\\sqrt{36}}=\\frac{2}{1}=2$. Since $z=2>z_{0.05}=1.645$, reject $H_0$.",
    Difficulty.EASY);
  await createProblem(hypothesis.id, "T-Test",
    "A sample of $n=16$ gives $\\bar{x}=24.5$, $s=3$. Test $H_0:\\mu=22$ vs $H_1:\\mu\\neq22$ at $\\alpha=0.05$.",
    "$t=\\frac{24.5-22}{3/\\sqrt{16}}=\\frac{2.5}{0.75}\\approx 3.33$. With $df=15$, $t_{0.025}=2.131$. Since $3.33>2.131$, reject $H_0$.",
    Difficulty.EASY);
  await createProblem(hypothesis.id, "Chi-Square Test",
    "Observed: $[20,30,50]$, Expected: $[33.3,33.3,33.3]$. Test goodness of fit at $\\alpha=0.05$.",
    "$\\chi^2=\\frac{(20-33.3)^2}{33.3}+\\frac{(30-33.3)^2}{33.3}+\\frac{(50-33.3)^2}{33.3}\\approx5.33+0.33+8.37=14.03$. With $df=2$, $\\chi^2_{0.05}=5.991$. Since $14.03>5.991$, reject $H_0$.",
    Difficulty.MEDIUM);
  await createProblem(hypothesis.id, "P-Value Interpretation",
    "A two-tailed test yields $z=1.96$. Find and interpret the $p$-value.",
    "$p=2(1-\\Phi(1.96))=2(1-0.975)=0.05$. At significance level $\\alpha=0.05$, this is on the boundary. We would just reject $H_0$.",
    Difficulty.MEDIUM);
  await createProblem(hypothesis.id, "Power of a Test",
    "For a one-sided Z-test with $n=25$, $\\sigma=5$, $\\alpha=0.05$, find the power when $\\mu=52$ and $\\mu_0=50$.",
    "Reject when $\\bar{x}>50+1.645\\cdot\\frac{5}{5}=51.645$. Power $=P(\\bar{x}>51.645\\mid\\mu=52)=P\\left(Z>\\frac{51.645-52}{1}\\right)=P(Z>-0.355)=\\Phi(0.355)\\approx 0.639$.",
    Difficulty.HARD);

  // ── Regression ────────────────────────────────────────────────────
  await createProblem(regression.id, "Simple Linear Regression",
    "Given data $(1,2),(2,4),(3,5),(4,4),(5,5)$, find the least-squares line $\\hat{y}=a+bx$.",
    "$\\bar{x}=3$, $\\bar{y}=4$. $b=\\frac{\\sum(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum(x_i-\\bar{x})^2}=\\frac{(-2)(-2)+(-1)(0)+(0)(1)+(1)(0)+(2)(1)}{4+1+0+1+4}=\\frac{6}{10}=0.6$. $a=4-0.6(3)=2.2$. Line: $\\hat{y}=2.2+0.6x$.",
    Difficulty.EASY);
  await createProblem(regression.id, "Coefficient of Determination",
    "Given $SS_{\\text{res}}=10$ and $SS_{\\text{tot}}=50$, find $R^2$ and interpret it.",
    "$R^2=1-\\frac{SS_{\\text{res}}}{SS_{\\text{tot}}}=1-\\frac{10}{50}=0.80$. The model explains $80\\%$ of the variance in $y$.",
    Difficulty.EASY);
  await createProblem(regression.id, "Multiple Regression",
    "In the model $y=\\beta_0+\\beta_1 x_1+\\beta_2 x_2+\\epsilon$, the normal equations in matrix form are $\\hat{\\beta}=(X^TX)^{-1}X^Ty$. Explain each term.",
    "$X$ is the design matrix with a column of ones and columns for $x_1,x_2$. $y$ is the response vector. $X^TX$ captures predictor correlations. $(X^TX)^{-1}X^Ty$ minimizes $\\|y-X\\beta\\|^2$.",
    Difficulty.MEDIUM);
  await createProblem(regression.id, "Residual Analysis",
    "A regression gives residuals $e_i$ with $\\sum e_i^2=20$, $n=10$, $p=2$. Find the residual standard error.",
    "$s=\\sqrt{\\frac{\\sum e_i^2}{n-p-1}}=\\sqrt{\\frac{20}{10-2-1}}=\\sqrt{\\frac{20}{7}}\\approx 1.69$.",
    Difficulty.MEDIUM);
  await createProblem(regression.id, "Ridge Regression",
    "Explain how ridge regression modifies the OLS estimator and write the ridge estimator formula.",
    "Ridge regression adds an $L_2$ penalty: $\\hat{\\beta}_{\\text{ridge}}=(X^TX+\\lambda I)^{-1}X^Ty$. The regularization parameter $\\lambda>0$ shrinks coefficients toward zero, reducing variance at the cost of introducing bias. This is especially useful when $X^TX$ is ill-conditioned.",
    Difficulty.HARD);

  // ── Bayesian Statistics ───────────────────────────────────────────
  await createProblem(bayesian.id, "Prior and Posterior",
    "With a $\\text{Beta}(2,2)$ prior for $\\theta$ and 7 heads in 10 coin flips, find the posterior distribution.",
    "Likelihood: $\\theta^7(1-\\theta)^3$. Posterior $\\propto \\theta^{7+2-1}(1-\\theta)^{3+2-1}=\\theta^8(1-\\theta)^4$. So the posterior is $\\text{Beta}(9,5)$.",
    Difficulty.EASY);
  await createProblem(bayesian.id, "Conjugate Priors",
    "For a Poisson likelihood with parameter $\\lambda$, what is the conjugate prior? Derive the posterior.",
    "The conjugate prior is $\\text{Gamma}(\\alpha,\\beta)$. With data $x_1,\\dots,x_n$: posterior $\\propto \\lambda^{\\sum x_i}e^{-n\\lambda}\\cdot\\lambda^{\\alpha-1}e^{-\\beta\\lambda}=\\lambda^{\\alpha+\\sum x_i-1}e^{-(\\beta+n)\\lambda}$, so posterior is $\\text{Gamma}(\\alpha+\\sum x_i, \\beta+n)$.",
    Difficulty.MEDIUM);
  await createProblem(bayesian.id, "MAP Estimation",
    "Given prior $\\theta\\sim N(0,1)$ and single observation $x=2$ from $N(\\theta,1)$, find the MAP estimate.",
    "Posterior $\\propto e^{-(x-\\theta)^2/2}\\cdot e^{-\\theta^2/2}=e^{-(2-\\theta)^2/2-\\theta^2/2}$. Maximize: $\\frac{d}{d\\theta}[-(2-\\theta)^2-\\theta^2]=2(2-\\theta)-2\\theta=0$, so $\\theta_{\\text{MAP}}=1$.",
    Difficulty.MEDIUM);
  await createProblem(bayesian.id, "Credible Interval",
    "A posterior distribution is $\\text{Beta}(10,5)$. Find the posterior mean and a $95\\%$ credible interval.",
    "Posterior mean $=\\frac{10}{10+5}=\\frac{2}{3}\\approx0.667$. Using the Beta quantile function: the $95\\%$ equal-tailed credible interval is approximately $(0.443, 0.856)$.",
    Difficulty.HARD);
  await createProblem(bayesian.id, "Bayesian vs Frequentist",
    "Explain the key difference between a Bayesian credible interval and a frequentist confidence interval for a parameter $\\theta$.",
    "A $95\\%$ Bayesian credible interval states $P(\\theta\\in[a,b]\\mid\\text{data})=0.95$, directly giving the probability $\\theta$ lies in the interval. A $95\\%$ frequentist confidence interval means that if we repeated the experiment many times, $95\\%$ of computed intervals would contain the true $\\theta$. The Bayesian approach treats $\\theta$ as random; the frequentist treats it as fixed.",
    Difficulty.EASY);

  // ── Logic ─────────────────────────────────────────────────────────
  await createProblem(logic.id, "Truth Table",
    "Construct the truth table for $(p \\Rightarrow q) \\land (q \\Rightarrow p)$.",
    "This is $p \\Leftrightarrow q$. Truth table:\n| $p$ | $q$ | $p\\Rightarrow q$ | $q\\Rightarrow p$ | Result |\n|---|---|---|---|---|\n| T | T | T | T | T |\n| T | F | F | T | F |\n| F | T | T | F | F |\n| F | F | T | T | T |",
    Difficulty.EASY);
  await createProblem(logic.id, "Logical Equivalence",
    "Prove that $\\neg(p \\land q) \\equiv \\neg p \\lor \\neg q$ (De Morgan's Law).",
    "By truth table, both sides have the same values for all combinations of $p,q$: when both true, LHS = $\\neg T = F$ and RHS = $F\\lor F = F$. When $p=T,q=F$: LHS = $\\neg F = T$ and RHS = $F\\lor T = T$. Similarly for remaining cases.",
    Difficulty.EASY);
  await createProblem(logic.id, "Predicate Logic",
    "Negate the statement: $\\forall x\\in\\mathbb{R},\\; \\exists y\\in\\mathbb{R},\\; x+y>0$.",
    "$\\exists x\\in\\mathbb{R},\\; \\forall y\\in\\mathbb{R},\\; x+y\\le 0$.",
    Difficulty.MEDIUM);
  await createProblem(logic.id, "Proof by Contradiction",
    "Prove by contradiction that $\\sqrt{2}$ is irrational.",
    "Assume $\\sqrt{2}=a/b$ with $\\gcd(a,b)=1$. Then $2b^2=a^2$, so $a^2$ is even, hence $a$ is even. Write $a=2k$: $2b^2=4k^2$, so $b^2=2k^2$, meaning $b$ is also even. This contradicts $\\gcd(a,b)=1$. Therefore $\\sqrt{2}$ is irrational.",
    Difficulty.MEDIUM);
  await createProblem(logic.id, "Proof by Induction",
    "Prove by induction that $\\displaystyle\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$ for all $n\\ge 1$.",
    "Base case ($n=1$): $1=\\frac{1\\cdot2}{2}=1$. ✓ Inductive step: assume $\\sum_{i=1}^k i=\\frac{k(k+1)}{2}$. Then $\\sum_{i=1}^{k+1}i=\\frac{k(k+1)}{2}+(k+1)=\\frac{k(k+1)+2(k+1)}{2}=\\frac{(k+1)(k+2)}{2}$. ✓",
    Difficulty.HARD);

  // ── Sets and Relations ────────────────────────────────────────────
  await createProblem(setsRelations.id, "Set Operations",
    "Let $A=\\{1,2,3,4\\}$ and $B=\\{3,4,5,6\\}$. Find $A\\cup B$, $A\\cap B$, and $A\\setminus B$.",
    "$A\\cup B=\\{1,2,3,4,5,6\\}$, $A\\cap B=\\{3,4\\}$, $A\\setminus B=\\{1,2\\}$.",
    Difficulty.EASY);
  await createProblem(setsRelations.id, "Equivalence Relation",
    "Show that $a\\sim b \\iff a\\equiv b\\pmod{3}$ is an equivalence relation on $\\mathbb{Z}$.",
    "Reflexive: $a-a=0=3\\cdot0$. Symmetric: $3\\mid(a-b)\\Rightarrow 3\\mid(b-a)$. Transitive: if $3\\mid(a-b)$ and $3\\mid(b-c)$ then $3\\mid(a-c)$. ✓",
    Difficulty.EASY);
  await createProblem(setsRelations.id, "Partial Orders",
    "Is the relation $\\le$ on $\\mathbb{R}$ a partial order? Is it a total order?",
    "Reflexive: $a\\le a$. ✓ Antisymmetric: $a\\le b$ and $b\\le a$ imply $a=b$. ✓ Transitive: $a\\le b$ and $b\\le c$ imply $a\\le c$. ✓ So it is a partial order. Since for any $a,b\\in\\mathbb{R}$, either $a\\le b$ or $b\\le a$, it is also a total order.",
    Difficulty.MEDIUM);
  await createProblem(setsRelations.id, "Functions as Relations",
    "Prove that $f:\\mathbb{R}\\to\\mathbb{R}$ given by $f(x)=x^3$ is a bijection.",
    "Injective: if $x^3=y^3$ then $x=y$ (cube root is unique on $\\mathbb{R}$). Surjective: for any $y\\in\\mathbb{R}$, $x=\\sqrt[3]{y}$ satisfies $f(x)=y$. Hence $f$ is bijective.",
    Difficulty.MEDIUM);
  await createProblem(setsRelations.id, "Cardinality",
    "Prove that $|(0,1)|=|\\mathbb{R}|$ by exhibiting a bijection.",
    "Use $f:(0,1)\\to\\mathbb{R}$ defined by $f(x)=\\tan\\!\\left(\\pi x - \\frac{\\pi}{2}\\right)$. This is continuous, strictly increasing on $(0,1)$, with $\\lim_{x\\to0^+}f(x)=-\\infty$ and $\\lim_{x\\to1^-}f(x)=+\\infty$. Hence $f$ is a bijection.",
    Difficulty.HARD);

  // ── Combinatorics ─────────────────────────────────────────────────
  await createProblem(combinatorics.id, "Permutations",
    "How many ways can 5 people be arranged in a line?",
    "$5! = 120$.",
    Difficulty.EASY);
  await createProblem(combinatorics.id, "Combinations",
    "A committee of 3 is chosen from 10 people. How many committees are possible?",
    "$\\binom{10}{3}=\\frac{10!}{3!7!}=120$.",
    Difficulty.EASY);
  await createProblem(combinatorics.id, "Pigeonhole Principle",
    "Prove that among any 13 integers, at least two have the same remainder when divided by 12.",
    "There are 12 possible remainders $\\{0,1,\\dots,11\\}$. With 13 integers and 12 \"pigeonholes\", by the Pigeonhole Principle at least two integers share a remainder.",
    Difficulty.MEDIUM);
  await createProblem(combinatorics.id, "Stars and Bars",
    "Find the number of non-negative integer solutions to $x_1+x_2+x_3=10$.",
    "By stars and bars: $\\binom{10+3-1}{3-1}=\\binom{12}{2}=66$.",
    Difficulty.MEDIUM);
  await createProblem(combinatorics.id, "Derangements",
    "Find the number of derangements of $\\{1,2,3,4,5\\}$.",
    "$D_5=5!\\sum_{k=0}^{5}\\frac{(-1)^k}{k!}=120\\left(1-1+\\frac{1}{2}-\\frac{1}{6}+\\frac{1}{24}-\\frac{1}{120}\\right)=120\\cdot\\frac{11}{30}=44$.",
    Difficulty.HARD);

  // ── Graph Theory ──────────────────────────────────────────────────
  await createProblem(graphTheory.id, "Handshaking Lemma",
    "A graph has 6 vertices with degrees $2,3,3,4,4,2$. How many edges does it have?",
    "By the Handshaking Lemma: $|E|=\\frac{1}{2}\\sum d_i = \\frac{2+3+3+4+4+2}{2}=\\frac{18}{2}=9$.",
    Difficulty.EASY);
  await createProblem(graphTheory.id, "Euler Circuits",
    "Does $K_4$ (complete graph on 4 vertices) have an Euler circuit?",
    "Each vertex of $K_4$ has degree 3 (odd). An Euler circuit exists iff every vertex has even degree. Since all degrees are odd, $K_4$ has no Euler circuit.",
    Difficulty.EASY);
  await createProblem(graphTheory.id, "Graph Coloring",
    "What is the chromatic number of the cycle graph $C_5$?",
    "$C_5$ is an odd cycle. Odd cycles require 3 colors (2 colors create a conflict at the last vertex). So $\\chi(C_5)=3$.",
    Difficulty.MEDIUM);
  await createProblem(graphTheory.id, "Trees and Spanning Trees",
    "How many labeled spanning trees does $K_4$ have?",
    "By Cayley's formula: $n^{n-2}=4^{4-2}=4^2=16$ labeled spanning trees.",
    Difficulty.MEDIUM);
  await createProblem(graphTheory.id, "Planar Graphs",
    "Prove that $K_5$ is not planar using Euler's formula.",
    "$K_5$ has $n=5$ vertices and $e=\\binom{5}{2}=10$ edges. For a planar graph: $e\\le 3n-6=3(5)-6=9$. Since $10>9$, $K_5$ is not planar.",
    Difficulty.HARD);

  // ── Number Theory ─────────────────────────────────────────────────
  await createProblem(numberTheory.id, "GCD via Euclidean Algorithm",
    "Find $\\gcd(252,198)$ using the Euclidean algorithm.",
    "$252=1\\cdot198+54$, $198=3\\cdot54+36$, $54=1\\cdot36+18$, $36=2\\cdot18+0$. So $\\gcd(252,198)=18$.",
    Difficulty.EASY);
  await createProblem(numberTheory.id, "Modular Arithmetic",
    "Find $7^{100}\\pmod{13}$.",
    "By Fermat's Little Theorem, $7^{12}\\equiv 1\\pmod{13}$. $100=12\\cdot8+4$, so $7^{100}\\equiv 7^4\\pmod{13}$. $7^2=49\\equiv10$, $7^4\\equiv100\\equiv9\\pmod{13}$.",
    Difficulty.MEDIUM);
  await createProblem(numberTheory.id, "Chinese Remainder Theorem",
    "Solve: $x\\equiv 2\\pmod{3}$ and $x\\equiv 3\\pmod{5}$.",
    "From the first: $x=3k+2$. Substitute: $3k+2\\equiv3\\pmod{5}$, so $3k\\equiv1\\pmod5$, $k\\equiv2\\pmod5$. Thus $x=3(5m+2)+2=15m+8$. Solution: $x\\equiv 8\\pmod{15}$.",
    Difficulty.MEDIUM);
  await createProblem(numberTheory.id, "Euler's Totient Function",
    "Compute $\\phi(60)$.",
    "$60=2^2\\cdot3\\cdot5$. $\\phi(60)=60\\left(1-\\frac{1}{2}\\right)\\left(1-\\frac{1}{3}\\right)\\left(1-\\frac{1}{5}\\right)=60\\cdot\\frac{1}{2}\\cdot\\frac{2}{3}\\cdot\\frac{4}{5}=16$.",
    Difficulty.EASY);
  await createProblem(numberTheory.id, "Quadratic Residues",
    "Determine whether $2$ is a quadratic residue modulo $7$.",
    "Compute $x^2\\pmod{7}$ for $x=1,\\dots,6$: $1,4,2,2,4,1$. Since $2$ appears ($3^2\\equiv2\\pmod7$), $2$ is a quadratic residue mod $7$.",
    Difficulty.HARD);

  // ── Sequences and Limits (Real Analysis) ──────────────────────────
  await createProblem(sequences.id, "Convergent Sequence",
    "Prove that $a_n = \\frac{1}{n}$ converges to $0$.",
    "Given $\\epsilon>0$, choose $N>\\frac{1}{\\epsilon}$. For $n>N$: $|a_n-0|=\\frac{1}{n}<\\frac{1}{N}<\\epsilon$. By definition, $a_n\\to 0$.",
    Difficulty.EASY);
  await createProblem(sequences.id, "Monotone Convergence Theorem",
    "Let $a_1=1$ and $a_{n+1}=\\frac{1}{2}(a_n+3/a_n)$. Show $\\{a_n\\}$ converges and find its limit.",
    "By AM-GM, $a_{n+1}\\ge\\sqrt{3}$ for all $n$. One can show $a_n$ is decreasing (for $a_n>\\sqrt{3}$) and bounded below. By MCT, $L$ exists. Setting $L=\\frac{1}{2}(L+3/L)$ gives $L^2=3$, so $L=\\sqrt{3}$.",
    Difficulty.MEDIUM);
  await createProblem(sequences.id, "Cauchy Sequences",
    "Prove that every convergent sequence in $\\mathbb{R}$ is Cauchy.",
    "Let $a_n\\to L$. Given $\\epsilon>0$, $\\exists N$ with $|a_n-L|<\\epsilon/2$ for $n>N$. For $m,n>N$: $|a_m-a_n|\\le|a_m-L|+|L-a_n|<\\epsilon/2+\\epsilon/2=\\epsilon$.",
    Difficulty.EASY);
  await createProblem(sequences.id, "Bolzano-Weierstrass Theorem",
    "Prove that the sequence $a_n=(-1)^n(1-1/n)$ has a convergent subsequence.",
    "The sequence is bounded: $|a_n|<1$. By Bolzano-Weierstrass, it has a convergent subsequence. In fact, $a_{2k}=1-1/(2k)\\to 1$ and $a_{2k+1}=-(1-1/(2k+1))\\to -1$.",
    Difficulty.MEDIUM);
  await createProblem(sequences.id, "Limsup and Liminf",
    "Find $\\limsup_{n\\to\\infty} a_n$ and $\\liminf_{n\\to\\infty} a_n$ for $a_n=(-1)^n+\\frac{1}{n}$.",
    "For even $n$: $a_n=1+1/n\\to 1$. For odd $n$: $a_n=-1+1/n\\to -1$. So $\\limsup a_n=1$ and $\\liminf a_n=-1$.",
    Difficulty.HARD);

  // ── Continuity (Real Analysis) ────────────────────────────────────
  await createProblem(continuity.id, "Epsilon-Delta Continuity",
    "Prove that $f(x)=3x+1$ is continuous at $x=2$ using the $\\epsilon$-$\\delta$ definition.",
    "Given $\\epsilon>0$, let $\\delta=\\epsilon/3$. If $|x-2|<\\delta$, then $|f(x)-f(2)|=|3x+1-7|=3|x-2|<3\\delta=\\epsilon$.",
    Difficulty.EASY);
  await createProblem(continuity.id, "Intermediate Value Theorem",
    "Show that $f(x)=x^3-x-1$ has a root in $[1,2]$.",
    "$f(1)=1-1-1=-1<0$ and $f(2)=8-2-1=5>0$. Since $f$ is continuous (polynomial) and changes sign, by IVT there exists $c\\in(1,2)$ with $f(c)=0$.",
    Difficulty.EASY);
  await createProblem(continuity.id, "Uniform Continuity",
    "Prove that $f(x)=x^2$ is uniformly continuous on $[0,1]$.",
    "On $[0,1]$, $|f(x)-f(y)|=|x^2-y^2|=|x+y||x-y|\\le 2|x-y|$. Given $\\epsilon>0$, choose $\\delta=\\epsilon/2$. If $|x-y|<\\delta$, then $|f(x)-f(y)|\\le 2\\delta=\\epsilon$.",
    Difficulty.MEDIUM);
  await createProblem(continuity.id, "Continuity of Compositions",
    "Prove: if $f$ is continuous at $a$ and $g$ is continuous at $f(a)$, then $g\\circ f$ is continuous at $a$.",
    "Given $\\epsilon>0$, since $g$ is continuous at $f(a)$, $\\exists\\delta_1>0$ with $|y-f(a)|<\\delta_1\\Rightarrow|g(y)-g(f(a))|<\\epsilon$. Since $f$ is continuous at $a$, $\\exists\\delta>0$ with $|x-a|<\\delta\\Rightarrow|f(x)-f(a)|<\\delta_1$. Combining: $|x-a|<\\delta\\Rightarrow|g(f(x))-g(f(a))|<\\epsilon$.",
    Difficulty.MEDIUM);
  await createProblem(continuity.id, "Discontinuity Classification",
    "Classify the discontinuity of $f(x)=\\frac{\\sin x}{x}$ at $x=0$ (with $f(0)$ undefined).",
    "Since $\\lim_{x\\to 0}\\frac{\\sin x}{x}=1$ exists and is finite, $x=0$ is a removable discontinuity. Defining $f(0)=1$ makes $f$ continuous at $0$.",
    Difficulty.HARD);

  // ── Differentiation (Real Analysis) ───────────────────────────────
  await createProblem(differentiation.id, "Differentiability from Definition",
    "Use the limit definition to show $f(x)=x^3$ is differentiable at $x=1$ and find $f'(1)$.",
    "$f'(1)=\\lim_{h\\to0}\\frac{(1+h)^3-1}{h}=\\lim_{h\\to0}\\frac{3h+3h^2+h^3}{h}=\\lim_{h\\to0}(3+3h+h^2)=3$.",
    Difficulty.EASY);
  await createProblem(differentiation.id, "Mean Value Theorem",
    "Apply the MVT to $f(x)=x^2$ on $[1,3]$ and find the guaranteed $c$.",
    "$\\frac{f(3)-f(1)}{3-1}=\\frac{9-1}{2}=4$. We need $f'(c)=2c=4$, so $c=2\\in(1,3)$.",
    Difficulty.EASY);
  await createProblem(differentiation.id, "L'Hôpital and Differentiability",
    "Let $f(x)=x^2\\sin(1/x)$ for $x\\neq 0$ and $f(0)=0$. Is $f$ differentiable at $0$?",
    "$f'(0)=\\lim_{h\\to0}\\frac{h^2\\sin(1/h)}{h}=\\lim_{h\\to0}h\\sin(1/h)=0$ (squeeze). So $f'(0)=0$ and $f$ is differentiable at $0$.",
    Difficulty.MEDIUM);
  await createProblem(differentiation.id, "Taylor's Theorem with Remainder",
    "State Taylor's theorem with Lagrange remainder for $f(x)=e^x$ centered at $a=0$, and bound the error for $|x|\\le 1$ using $n=3$.",
    "$e^x=1+x+\\frac{x^2}{2}+\\frac{x^3}{6}+\\frac{e^c}{24}x^4$ for some $c$ between $0$ and $x$. For $|x|\\le 1$: $|R_3(x)|\\le\\frac{e^1}{24}\\cdot 1=\\frac{e}{24}\\approx 0.113$.",
    Difficulty.MEDIUM);
  await createProblem(differentiation.id, "Darboux's Theorem",
    "State Darboux's theorem and give an example of a function with a discontinuous derivative that illustrates it.",
    "Darboux's theorem: if $f$ is differentiable on $[a,b]$ and $f'(a)<\\gamma<f'(b)$, then $\\exists c\\in(a,b)$ with $f'(c)=\\gamma$. Example: $f(x)=x^2\\sin(1/x)$ for $x\\neq0$, $f(0)=0$. Then $f'(x)=2x\\sin(1/x)-\\cos(1/x)$ for $x\\neq 0$ and $f'(0)=0$. The derivative $f'$ is discontinuous at $0$ but still satisfies the intermediate value property.",
    Difficulty.HARD);

  // ── Riemann Integration (Real Analysis) ────────────────────────────
  await createProblem(riemannIntegration.id, "Riemann Sum",
    "Compute the upper and lower Riemann sums for $f(x)=x^2$ on $[0,1]$ with $n=2$ equal subintervals.",
    "Subintervals: $[0,1/2],[1/2,1]$. Lower sum: $L=0\\cdot\\frac{1}{2}+(1/4)\\cdot\\frac{1}{2}=1/8$. Upper sum: $U=(1/4)\\cdot\\frac{1}{2}+1\\cdot\\frac{1}{2}=5/8$.",
    Difficulty.EASY);
  await createProblem(riemannIntegration.id, "Integrability Criterion",
    "Prove that $f(x)=x$ is Riemann integrable on $[0,1]$.",
    "For a uniform partition with $n$ subintervals: $U_n-L_n=\\sum_{i=1}^n\\frac{i}{n}\\cdot\\frac{1}{n}-\\sum_{i=0}^{n-1}\\frac{i}{n}\\cdot\\frac{1}{n}=\\frac{1}{n}$. As $n\\to\\infty$, $U_n-L_n\\to 0$, so $f$ is integrable.",
    Difficulty.EASY);
  await createProblem(riemannIntegration.id, "Fundamental Theorem of Calculus",
    "Let $F(x)=\\int_0^x t^2\\,dt$. Find $F'(x)$ and verify with direct computation.",
    "By FTC Part 1: $F'(x)=x^2$. Direct: $F(x)=\\frac{x^3}{3}$, so $F'(x)=x^2$. ✓",
    Difficulty.MEDIUM);
  await createProblem(riemannIntegration.id, "Improper Integrals",
    "Determine whether $\\int_1^\\infty \\frac{1}{x^2}\\,dx$ converges and evaluate it.",
    "$\\int_1^R\\frac{1}{x^2}dx=\\left[-\\frac{1}{x}\\right]_1^R=1-\\frac{1}{R}$. As $R\\to\\infty$, this approaches $1$. The integral converges to $1$.",
    Difficulty.MEDIUM);
  await createProblem(riemannIntegration.id, "Lebesgue's Criterion",
    "State Lebesgue's criterion for Riemann integrability and use it to show the Dirichlet function is not Riemann integrable on $[0,1]$.",
    "Lebesgue's criterion: $f$ is Riemann integrable on $[a,b]$ iff $f$ is bounded and continuous a.e. (the set of discontinuities has measure zero). The Dirichlet function $\\mathbf{1}_{\\mathbb{Q}}$ is discontinuous everywhere on $[0,1]$, so its set of discontinuities has measure $1\\neq 0$. Hence it is not Riemann integrable.",
    Difficulty.HARD);

  // ── Metric Spaces ─────────────────────────────────────────────────
  await createProblem(metricSpaces.id, "Metric Verification",
    "Verify that $d(x,y)=|x-y|$ defines a metric on $\\mathbb{R}$.",
    "1) $d(x,y)\\ge 0$ and $d(x,y)=0\\iff x=y$. ✓ 2) $d(x,y)=|x-y|=|y-x|=d(y,x)$. ✓ 3) $d(x,z)=|x-z|\\le|x-y|+|y-z|=d(x,y)+d(y,z)$. ✓",
    Difficulty.EASY);
  await createProblem(metricSpaces.id, "Open and Closed Sets",
    "Prove that $(0,1)$ is open in $(\\mathbb{R},|\\cdot|)$.",
    "Let $x\\in(0,1)$. Choose $r=\\min(x,1-x)>0$. Then $B(x,r)=(x-r,x+r)\\subseteq(0,1)$, since $x-r\\ge0$ and $x+r\\le1$. So every point is interior, hence $(0,1)$ is open.",
    Difficulty.EASY);
  await createProblem(metricSpaces.id, "Completeness",
    "Show that $(\\mathbb{Q},|\\cdot|)$ is not a complete metric space.",
    "Consider $a_n=(1+1/n)^n$. This is a Cauchy sequence in $\\mathbb{Q}$ but $\\lim a_n=e\\notin\\mathbb{Q}$. Alternatively, take rational approximations to $\\sqrt{2}$: $1, 1.4, 1.41, \\dots$, which is Cauchy in $\\mathbb{Q}$ but converges to $\\sqrt{2}\\notin\\mathbb{Q}$.",
    Difficulty.MEDIUM);
  await createProblem(metricSpaces.id, "Compactness",
    "Prove that $[0,1]$ is compact in $\\mathbb{R}$ using sequential compactness.",
    "Let $\\{x_n\\}\\subseteq[0,1]$. Since $\\{x_n\\}$ is bounded, by Bolzano-Weierstrass it has a convergent subsequence $x_{n_k}\\to x$. Since $0\\le x_{n_k}\\le 1$ for all $k$, $0\\le x\\le 1$. So $x\\in[0,1]$, proving $[0,1]$ is sequentially compact.",
    Difficulty.MEDIUM);
  await createProblem(metricSpaces.id, "Contraction Mapping Theorem",
    "State the Banach fixed-point theorem and use it to show $f(x)=\\frac{1}{2}x+1$ has a unique fixed point in $\\mathbb{R}$.",
    "Banach: if $(X,d)$ is complete and $f:X\\to X$ satisfies $d(f(x),f(y))\\le c\\,d(x,y)$ for $c<1$, then $f$ has a unique fixed point. Here $|f(x)-f(y)|=\\frac{1}{2}|x-y|$ so $c=1/2<1$. Since $\\mathbb{R}$ is complete, $f$ has a unique fixed point: $x=\\frac{1}{2}x+1\\Rightarrow x=2$.",
    Difficulty.HARD);

  console.log("✅ Seed complete: 5 topics, 25 subtopics, 125 problems created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
