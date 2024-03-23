from django.urls import path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from . import views
urlpatterns = [
                             # ex: /simulate/
    path('', views.index, name='index'),
                             # ex : /simulate/input/
    path('SimulationInput/', views.SimulationInput, name='SimulationInput'),
                            # ex : /simulate/bisRotationSolver/
    path('bisRotationSolver/', views.bisRotationSolver, name='bisRotationSolver'),
                            # ex : /simulate/createGearSearchSpace/
    path('createGearSearchSpace/', views.createGearSearchSpace, name='createGearSearchSpace'), 
                            # ex : /simulate/createGearSearchSpace/
    path('importFFLogs/', views.importFFLogs, name='importFFLogs'), 
                            # ex : /simulate/createGearSearchSpace/
    path('simulationRecordCustomizeView/', views.simulationRecordCustomizeView, name='simulationRecordCustomizeView'), 
                            # ex : /simulate/solverLoading/
    path('solverLoading/', views.solverLoading, name='solverLoading'), 
                             # ex : /simulate/simulationLoading/
    path('simulationLoading/', views.simulationLoading, name='simulationLoading'),
                             # ex : /simulate/SimulationResult/
    path('SimulationResult/', views.SimulationResult, name='SimulationResult'),
                             # ex : /simulate/helpSolver/
    path('helpSolver/', views.helpSolver, name='helpSolver'),
                             # ex : /simulate/solverResult/
    path('solverResult/', views.solverResult, name='solverResult'), 
                             # ex : /simulate/credit/
    path('credit/', views.credit, name='credit'),
                             # ex : /simulate/JSONFileViewer/
    path('JSONFileViewer/', views.JSONFileViewer, name='JSONFileViewer'),
                             # ex : /simulate/Error/
    path('Error/', views.Error, name='Error'),
                             # ex : /simulate/help/
    path('help/', views.help, name='help'),
                             # ex : /simulate/WaitingQueue/
    path('More/', views.More, name='More')
                             # ex : /simulate/WaitingQueue/
    #path('WaitingQueue/', views.WaitingQueue, name='WaitingQueue')
]
urlpatterns += staticfiles_urlpatterns()