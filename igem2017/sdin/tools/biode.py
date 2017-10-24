"""
The International Genetically Engineered Machine Competition
Project : ODE System of Genetic Parts
Institution : SYSU
Team : SYSU_Software
Coders : FXY
All Right Reserved
"""


"""Import Libraries"""
# Solving Ordinary Differential Equation System
from scipy.integrate import odeint 
# Plotting
#import matplotlib.pyplot as plt 
# Efficient numerical Library
import numpy as np
# For Sigmoid Calculation
from math import exp

def CIR2ODE( A , I ):
    """
    Notes on CIR2ODE function:
        -----------------------------------------------------------------------
        The first input of the function is a n×n matrix A ,and Aij has 3 
        possible values: {-1,0,1} , where -1 for inhibition , 1 for promotion 
        and 0 for zero impact.( A -> numpy array )
        -----------------------------------------------------------------------
        The second input of the function is the Initial Data of all the substances
        interoperated in the dynamic genetic system. ( I -> numpy array )
        -----------------------------------------------------------------------
        The output of the function is the Numerical Solution to the ODE System
        which is constructed based on the matrix A.
        -----------------------------------------------------------------------
    """
    # Number of parts involved in the Genetic System
    n = len(A)
    
    # Convert matrix A into ODE System
    def ODE(X,t) :
        """
        Notes on ODE function:
            The first input X is a n×1 vector which denotes the position of n
            dimensional point.
            The purpose of the function is to calculate the derivative of the
            function vector based on X.
        """
        DXDT = []
        for i in range(n): #Calculate dxi/dt
            dxdt = 1
            for index in range(n):
                j = A[index][i]
                if j == 1: #Promotion
                    dxdt *= (1.0/( 1+exp(-X[index]) ))+1 
                elif j == 0: #No Impact
                    continue
                else: #Inhibition
                    dxdt *= (-1.0/( 1+exp(-X[index]) ) )+1
            dxdt -= 0.5*X[i]#Degradation
            DXDT.append( dxdt )
        return np.array(DXDT)
        
    # The time interval when the System interoperates 
    t = np.arange(0,10,0.1)
    
    # The track of the n dimentional point along the time axis
    track = odeint( ODE, I , t)
    return (t,track)
    # Plot the Numerical Solution to the Dynamic System
    # Seperately
    """
    plt.figure(1)
    for i in range(n):
        plt.subplot( 100*n + 10 +(i+1) )
        plt.plot(t,track[:,i])
    plt.show()
    """
    
    # Plot the Numerical Solution to the Dynamic System
    # Jointly
    """
    plt.figure(2)
    for i in range(n):
        plt.plot(t,track[:,i])
    plt.show()
    """
