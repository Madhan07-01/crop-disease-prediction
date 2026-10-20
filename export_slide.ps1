try {
    $ppt = New-Object -ComObject PowerPoint.Application
    $pres = $ppt.Presentations.Open('D:\project\FSD\crop-disease-prediction\FSD PROJECT PPT FINAL_WithUseCase.pptx', -1, 0, 0)
    $slide12 = $pres.Slides.Item(12)
    $outImg = 'D:\project\FSD\crop-disease-prediction\slide12_preview.png'
    $slide12.Export($outImg, 'PNG', 1920, 1080)
    $pres.Close()
    $ppt.Quit()
    Write-Host "SUCCESS: Exported slide 12 preview to $outImg"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
