from setuptools import setup
from Cython.Build import cythonize

setup(
    ext_modules = cythonize("maldos_client.py")
)
# python cython-setup.py build_ext --inplace